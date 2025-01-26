export interface User {
    id: string;
    username: string;
    email: string;
    createdAt?: string;
    lastLogin?: string;
}

export interface ChatRoom {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    members: string[];
    createdAt: string;
    lastActivity: string;
}

export interface Message {
    id?: string;
    userId: string;
    username: string;
    roomId: string;
    content: string;
    timestamp: string;
    isSystem?: boolean;
}

export interface AuthResponse {
    id: string;
    username: string;
    email: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}
