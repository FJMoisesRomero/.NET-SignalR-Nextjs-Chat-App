import { AuthResponse, ChatRoom, LoginRequest, Message, RegisterRequest } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5151/api';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const api = {
    // Auth endpoints
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // Chat room endpoints
    async getRecentRooms(): Promise<ChatRoom[]> {
        const response = await fetch(`${API_URL}/chatroom/recent`, {
            headers: {
                'Accept': 'application/json',
            },
        });
        return handleResponse(response);
    },

    async getRoom(id: string): Promise<ChatRoom> {
        const response = await fetch(`${API_URL}/chatroom/${id}`, {
            headers: {
                'Accept': 'application/json',
            },
        });
        return handleResponse(response);
    },

    async createRoom(userId: string, name: string, description: string): Promise<ChatRoom> {
        const response = await fetch(`${API_URL}/chatroom`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ userId, name, description }),
        });
        return handleResponse(response);
    },

    async getRoomMessages(roomId: string): Promise<Message[]> {
        const response = await fetch(`${API_URL}/chatroom/${roomId}/messages`, {
            headers: {
                'Accept': 'application/json',
            },
        });
        return handleResponse(response);
    },
};

// Export individual functions that use the api object
export const register = (username: string, email: string, password: string) => 
    api.register({ username, email, password });

export const login = (username: string, password: string) => 
    api.login({ username, password });

export const createRoom = (userId: string, name: string, description: string) => 
    api.createRoom(userId, name, description);

export const getRooms = () => api.getRecentRooms();
