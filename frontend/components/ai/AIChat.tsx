'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, ArrowLeft } from 'lucide-react';
import { chatWithAI } from '@/services/ai';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
    role: 'user' | 'ai' | 'system';
    content: string;
}

interface AIChatProps {
    onBack?: () => void;
}

export function AIChat({ onBack }: AIChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Add welcome messages when component mounts
        setMessages([
            {
                role: 'system',
                content: `${user?.username || 'Usuario'} has joined the room`
            },
            {
                role: 'ai',
                content: '¡Hola! Soy tu asistente de IA. Estoy aquí para ayudarte, charlar o responder tus preguntas. ¿En qué puedo ayudarte hoy?'
            }
        ]);
    }, [user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        const userMessage = newMessage.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setNewMessage('');
        setIsLoading(true);

        try {
            const response = await chatWithAI(userMessage);
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        try {
            // Clean up any pending state or operations
            if (onBack) {
                onBack();
            }
        } catch (err) {
            console.error('Error leaving AI chat:', err);
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
                                AI Assistant
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Chatting with AI
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
                        <div
                            key={index}
                            className={`flex ${
                                message.role === 'system' 
                                    ? 'justify-center' 
                                    : message.role === 'user' 
                                        ? 'justify-end' 
                                        : 'justify-start'
                            }`}
                        >
                            {message.role === 'system' ? (
                                <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                    {message.content}
                                </div>
                            ) : (
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    }`}
                                >
                                    {message.content}
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2">
                            Pensando...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button 
                        type="submit" 
                        disabled={isLoading || !newMessage.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
