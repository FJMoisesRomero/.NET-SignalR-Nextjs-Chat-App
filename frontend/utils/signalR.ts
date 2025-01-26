import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Message } from '@/types';

class SignalRConnection {
    private static instance: SignalRConnection;
    private connection: HubConnection | null = null;
    private connectionPromise: Promise<void> | null = null;
    private messageHandlers: Set<(message: Message) => void> = new Set();
    private recentMessagesHandlers: Set<(messages: Message[]) => void> = new Set();

    private constructor() {
        this.createConnection();
    }

    private createConnection() {
        if (!this.connection) {
            this.connection = new HubConnectionBuilder()
                .withUrl('http://localhost:5151/chatHub')
                .withAutomaticReconnect()
                .build();

            this.setupConnectionEvents();
            this.setupMessageHandlers();
        }
    }

    private setupConnectionEvents() {
        if (!this.connection) return;

        this.connection.onclose(() => {
            console.log('SignalR connection closed');
            this.connectionPromise = null;
        });

        this.connection.onreconnecting(() => {
            console.log('SignalR attempting to reconnect...');
        });

        this.connection.onreconnected(() => {
            console.log('SignalR reconnected');
        });
    }

    private setupMessageHandlers() {
        if (!this.connection) return;

        // Set up a single handler for receiving messages
        this.connection.on('ReceiveMessage', (message: Message) => {
            this.messageHandlers.forEach(handler => handler(message));
        });

        // Set up a single handler for loading recent messages
        this.connection.on('LoadRecentMessages', (messages: Message[]) => {
            this.recentMessagesHandlers.forEach(handler => handler(messages));
        });
    }

    public static getInstance(): SignalRConnection {
        if (!SignalRConnection.instance) {
            SignalRConnection.instance = new SignalRConnection();
        }
        return SignalRConnection.instance;
    }

    public async startConnection(): Promise<void> {
        if (!this.connection) {
            this.createConnection();
        }

        if (this.connection?.state === HubConnectionState.Connected) {
            return Promise.resolve();
        }

        if (this.connection?.state === HubConnectionState.Connecting || 
            this.connection?.state === HubConnectionState.Reconnecting) {
            return this.connectionPromise || Promise.reject('Connection in progress');
        }

        if (!this.connectionPromise) {
            this.connectionPromise = this.connection!.start()
                .then(() => {
                    console.log('SignalR Connected');
                })
                .catch((err) => {
                    console.error('SignalR Connection Error:', err);
                    this.connectionPromise = null;
                    throw err;
                });
        }

        return this.connectionPromise;
    }

    public async stopConnection(): Promise<void> {
        if (!this.connection || this.connection.state === HubConnectionState.Disconnected) {
            this.connectionPromise = null;
            return Promise.resolve();
        }

        try {
            await this.connection.stop();
            this.connectionPromise = null;
        } catch (err) {
            console.error('Error stopping connection:', err);
            throw err;
        }
    }

    public async joinRoom(roomId: string, userId: string): Promise<void> {
        await this.ensureConnection();
        return this.connection!.invoke('JoinRoom', roomId, userId);
    }

    public async sendMessage(userId: string, roomId: string, content: string): Promise<void> {
        await this.ensureConnection();
        return this.connection!.invoke('SendMessage', userId, roomId, content);
    }

    public onReceiveMessage(callback: (message: Message) => void) {
        this.messageHandlers.add(callback);
    }

    public onLoadRecentMessages(callback: (messages: Message[]) => void) {
        this.recentMessagesHandlers.add(callback);
    }

    public removeMessageHandlers(callback?: (message: Message) => void) {
        if (callback) {
            this.messageHandlers.delete(callback);
        } else {
            this.messageHandlers.clear();
        }
    }

    public removeRecentMessagesHandlers(callback?: (messages: Message[]) => void) {
        if (callback) {
            this.recentMessagesHandlers.delete(callback);
        } else {
            this.recentMessagesHandlers.clear();
        }
    }

    private async ensureConnection(): Promise<void> {
        if (!this.connection || this.connection.state === HubConnectionState.Disconnected) {
            await this.startConnection();
        }
    }

    public getConnectionState(): HubConnectionState {
        return this.connection?.state || HubConnectionState.Disconnected;
    }

    public async reset(): Promise<void> {
        if (this.connection) {
            this.messageHandlers.clear();
            this.recentMessagesHandlers.clear();
            await this.stopConnection();
            this.connection = null;
            this.connectionPromise = null;
        }
        this.createConnection();
    }
}

export default SignalRConnection;
