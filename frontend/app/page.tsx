'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatRoom as ChatRoomType } from '@/types';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ChatRoomList } from '@/components/chat/ChatRoomList';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { CreateRoomForm } from '@/components/chat/CreateRoomForm';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Clicker } from '@/components/games/Clicker';
import { AIChat } from '@/components/ai/AIChat';
import { Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
    const { user, setUser, isLoading } = useAuth();
    const [showRegister, setShowRegister] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
    const [refreshRooms, setRefreshRooms] = useState(0);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
                {/* Animated stars/particles */}
                <div className="absolute inset-0">
                    <div className="absolute h-2 w-2 rounded-full bg-white/20 animate-pulse" style={{ top: '15%', left: '45%' }} />
                    <div className="absolute h-3 w-3 rounded-full bg-white/30 animate-pulse" style={{ top: '25%', left: '25%' }} />
                    <div className="absolute h-2 w-2 rounded-full bg-white/20 animate-pulse" style={{ top: '55%', left: '65%' }} />
                    <div className="absolute h-4 w-4 rounded-full bg-white/10 animate-pulse" style={{ top: '75%', left: '35%' }} />
                    <div className="absolute h-3 w-3 rounded-full bg-white/20 animate-pulse" style={{ top: '35%', left: '85%' }} />
                    <div className="absolute h-2 w-2 rounded-full bg-white/30 animate-pulse" style={{ top: '85%', left: '15%' }} />
                    <div className="absolute h-3 w-3 rounded-full bg-white/10 animate-pulse" style={{ top: '45%', left: '75%' }} />
                    {/* Floating orbs */}
                    <div className="absolute h-32 w-32 rounded-full bg-purple-500/20 blur-xl" style={{ top: '20%', left: '20%' }} />
                    <div className="absolute h-40 w-40 rounded-full bg-blue-500/20 blur-xl" style={{ top: '60%', left: '70%' }} />
                    <div className="absolute h-36 w-36 rounded-full bg-indigo-500/20 blur-xl" style={{ top: '40%', left: '50%' }} />
                </div>
                <div className="w-full max-w-md space-y-4 z-10">
                    {showRegister ? (
                        <>
                            <RegisterForm />
                            <p className="text-center text-sm text-white/70">
                                Already have an account?{' '}
                                <button
                                    onClick={() => setShowRegister(false)}
                                    className="text-white hover:underline"
                                >
                                    Login
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            <LoginForm />
                            <p className="text-center text-sm text-white/70">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => setShowRegister(true)}
                                    className="text-white hover:underline"
                                >
                                    Register
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        const username = user?.username;
        setUser(null);
        toast.success('Logged out successfully', {
            description: `See you soon, ${username}!`
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Welcome, {user.username}!
                    </h1>
                    <div className="flex items-center gap-4">
                        <CreateRoomForm onRoomCreated={(room) => {
                            setSelectedRoom(room);
                            setRefreshRooms(prev => prev + 1);
                        }} />
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="hover:bg-background/80"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    <div className="col-span-1">

                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 text-primary"
                                    onClick={() => setSelectedRoom({ id: 'ai', name: 'AI Assistant' } as ChatRoomType)}
                                >
                                    <Bot className="h-4 w-4" />
                                    AI Assistant
                                </Button>
                                <ChatRoomList
                                    onSelectRoom={setSelectedRoom}
                                    selectedRoomId={selectedRoom?.id}
                                    key={refreshRooms}
                                />
                            </div>
                    </div>
                    <div className="col-span-3">
                        {selectedRoom ? (
                            selectedRoom.id === 'ai' ? (
                                <AIChat onBack={() => setSelectedRoom(null)} />
                            ) : (
                                <ChatRoom 
                                    room={selectedRoom} 
                                    onBack={() => setSelectedRoom(null)}
                                />
                            )
                        ) : (
                            <div className="h-[calc(100vh-8rem)] max-h-[800px] flex flex-col items-center pt-24 bg-gradient-to-b from-background to-muted/20 rounded-lg p-6 gap-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Select a room to start chatting
                                </h1>
                                <div className="-mt-4">
                                    <Clicker />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
