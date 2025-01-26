'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SignalRConnection from '@/utils/signalR';
import { Message, ChatRoom as ChatRoomType } from '@/types';
import { ChatMessage } from './ChatMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Send, ArrowLeft } from 'lucide-react';

interface ChatRoomProps {
    room: ChatRoomType;
    onBack?: () => void;
}

export function ChatRoom({ room, onBack }: ChatRoomProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const signalR = useRef(SignalRConnection.getInstance());

    const handleReceiveMessage = useCallback((message: Message) => {
        setMessages(prev => {
            const newMessages = [...prev, message];
            return newMessages.sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
        });
    }, []);

    const handleLoadRecentMessages = useCallback((recentMessages: Message[]) => {
        setMessages(recentMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));
    }, []);

    useEffect(() => {
        const setupConnection = async () => {
            try {
                if (!user) return;

                // Reset connection to ensure clean state
                await signalR.current.reset();

                // Set up message handlers
                signalR.current.onReceiveMessage(handleReceiveMessage);
                signalR.current.onLoadRecentMessages(handleLoadRecentMessages);

                // Start connection and join room
                await signalR.current.startConnection();
                await signalR.current.joinRoom(room.id, user.id);
                setError('');
            } catch (err) {
                setError('Failed to connect to chat');
                console.error('Chat connection error:', err);
            }
        };

        setupConnection();

        // Cleanup
        return () => {
            const cleanup = async () => {
                try {
                    signalR.current.removeMessageHandlers(handleReceiveMessage);
                    signalR.current.removeRecentMessagesHandlers(handleLoadRecentMessages);
                    await signalR.current.stopConnection();
                } catch (err) {
                    console.error('Cleanup error:', err);
                }
            };
            cleanup();
        };
    }, [room.id, user, handleReceiveMessage, handleLoadRecentMessages]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;

        try {
            await signalR.current.sendMessage(user.id, room.id, newMessage.trim());
            setNewMessage('');
            setError('');
        } catch (err) {
            setError('Failed to send message');
            console.error('Send message error:', err);
        }
    };

    const generateMessageKey = (message: Message, index: number) => {
        if (message.id) return message.id;
        // Create a unique key using message properties and index
        return `${message.userId}-${message.timestamp}-${index}`;
    };

    const handleBack = async () => {
        try {
            // Clean up connection before going back
            signalR.current.removeMessageHandlers(handleReceiveMessage);
            signalR.current.removeRecentMessagesHandlers(handleLoadRecentMessages);
            await signalR.current.stopConnection();
            onBack?.();
        } catch (err) {
            console.error('Error leaving room:', err);
        }
    };

    return (
        <Card className="h-[calc(100vh-8rem)] max-h-[800px] flex flex-col bg-gradient-to-b from-background to-muted/20">
            <CardHeader className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleBack}
                            className="hover:bg-background/80"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {room.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {room.description}
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <ChatMessage 
                            key={generateMessageKey(message, index)} 
                            message={message} 
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
                {error && (
                    <div className="text-sm text-red-500 mb-2 animate-shake">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-background/50 focus-visible:ring-primary/60"
                    />
                    <Button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
