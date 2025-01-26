'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { api } from '@/services/api';
import { ChatRoom } from '@/types';

interface CreateRoomFormProps {
    onRoomCreated: (room: ChatRoom) => void;
}

export function CreateRoomForm({ onRoomCreated }: CreateRoomFormProps) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const newRoom = await api.createRoom(user.id, name, description);
            setName('');
            setDescription('');
            setError('');
            setIsOpen(false);
            onRoomCreated(newRoom);
        } catch (err) {
            setError('Failed to create room');
            console.error('Create room error:', err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Room
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Create New Room
                        </DialogTitle>
                        <DialogDescription>
                            Create a new chat room. Fill out the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Room Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter room name"
                                className="bg-background/50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter room description"
                                className="bg-background/50"
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500 animate-shake">
                                {error}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={!name.trim()}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            Create Room
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
