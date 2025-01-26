'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { UserPlus, Mail, User, Lock, Bot, MessageSquare, Sparkles, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function RegisterForm() {
    const { setUser } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            toast.error('Registration failed', {
                description: 'Passwords do not match'
            });
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Creating your account...');

        try {
            const user = await api.register({ username, email, password });
            setUser(user);
            toast.success('Welcome!', {
                description: 'Your account has been created successfully',
                id: loadingToast,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to register';
            setError(message);
            toast.error('Registration failed', {
                description: message,
                id: loadingToast,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full bg-black/40 backdrop-blur-lg border-white/10">
            <CardHeader className="space-y-4 pb-6">
                <div className="flex justify-center items-center space-x-2">
                    <Bot className="h-12 w-12 text-white" />
                    <Sparkles className="h-6 w-6 text-white/60 animate-pulse" />
                    <MessageSquare className="h-12 w-12 text-white/80" />
                </div>
                <div className="space-y-2">
                    <CardTitle className="text-3xl text-center text-white">
                        Join the Conversation
                    </CardTitle>
                    <CardDescription className="text-center text-white/70">
                        Create an account to chat with friends and AI assistants
                    </CardDescription>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative group">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/70 focus-visible:ring-white/20 pl-10 transition-all duration-200 group-hover:bg-black/30"
                                required
                            />
                            <User className="h-4 w-4 absolute left-3 top-3 pointer-events-none text-white/70 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="relative group">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/70 focus-visible:ring-white/20 pl-10 transition-all duration-200 group-hover:bg-black/30"
                                required
                            />
                            <Mail className="h-4 w-4 absolute left-3 top-3 pointer-events-none text-white/70 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="relative group">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/70 focus-visible:ring-white/20 pl-10 pr-10 transition-all duration-200 group-hover:bg-black/30"
                                required
                            />
                            <Lock className="h-4 w-4 absolute left-3 top-3 pointer-events-none text-white/70 group-hover:text-white transition-colors" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-white/70 hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <EyeOff className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="relative group">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/70 focus-visible:ring-white/20 pl-10 pr-10 transition-all duration-200 group-hover:bg-black/30"
                                required
                            />
                            <Lock className="h-4 w-4 absolute left-3 top-3 pointer-events-none text-white/70 group-hover:text-white transition-colors" />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-white/70 hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <EyeOff className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="text-sm text-red-400 animate-shake">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button 
                        type="submit" 
                        className="w-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 transform hover:scale-[1.02] backdrop-blur-lg"
                        disabled={isLoading}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
