'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { ChatRoom } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatRoomListProps {
    onSelectRoom: (room: ChatRoom) => void;
    selectedRoomId?: string;
}

export function ChatRoomList({ onSelectRoom, selectedRoomId }: ChatRoomListProps) {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const recentRooms = await api.getRecentRooms();
            setRooms(recentRooms);
        } catch (err) {
            setError('Failed to load rooms');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="h-full bg-gradient-to-b from-background to-muted/20">
                <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Chat Rooms
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                        Loading rooms...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="h-full bg-gradient-to-b from-background to-muted/20">
                <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Chat Rooms
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 text-red-500">
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full bg-gradient-to-b from-background to-muted/20">
            <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Chat Rooms
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-1">
                    {rooms.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                            No rooms available
                        </div>
                    ) : (
                        rooms.map((room) => (
                            <Button
                                key={room.id}
                                variant={selectedRoomId === room.id ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start px-4 py-6 relative group",
                                    selectedRoomId === room.id && "bg-muted/50 backdrop-blur-sm"
                                )}
                                onClick={() => onSelectRoom(room)}
                            >
                                <MessageSquare className={cn(
                                    "h-4 w-4 mr-2 transition-colors",
                                    selectedRoomId === room.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                )} />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{room.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {room.description}
                                    </span>
                                </div>
                                {selectedRoomId === room.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                )}
                            </Button>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
