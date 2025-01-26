'use client';

import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ChatMessageProps {
    message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const { user } = useAuth();
    const isCurrentUser = user?.id === message.userId;
    const isSystem = message.isSystem;

    if (isSystem) {
        return (
            <div className="flex justify-center my-2">
                <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex w-full mb-4 animate-in slide-in-from-bottom-2",
                isCurrentUser ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                    isCurrentUser
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted/50 backdrop-blur-sm rounded-bl-none"
                )}
            >
                {!isCurrentUser && (
                    <div className="font-medium text-sm mb-1 text-foreground/80">
                        {message.username}
                    </div>
                )}
                <div className="break-words">
                    {message.content}
                </div>
                <div className="text-[10px] mt-1 opacity-70 flex justify-end">
                    {format(new Date(message.timestamp), 'HH:mm')}
                </div>
            </div>
        </div>
    );
}
