import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import API_BASE_URL from '../config/apiConfig';

class SocketService {
    constructor() {
        this.socket = null;
        this.messageHandlers = new Set();
        this.notificationHandlers = new Set();
        this.typingHandlers = new Set();
        this.readHandlers = new Set();
    }

    connect() {
        if (this.socket?.connected) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        const socketUrl = API_BASE_URL.replace('/api', '');
        this.socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket']
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            toast.error('Connection error. Please try again.');
        });

        // Set up event listeners
        this.socket.on('receive_message', (data) => {
            this.messageHandlers.forEach(handler => handler(data));
        });

        this.socket.on('new_notification', (notification) => {
            this.notificationHandlers.forEach(handler => handler(notification));
            toast.success(notification.content);
        });

        this.socket.on('user_typing', (data) => {
            this.typingHandlers.forEach(handler => handler(data));
        });

        this.socket.on('message_read', (data) => {
            this.readHandlers.forEach(handler => handler(data));
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Message handling
    sendMessage(receiverId, content) {
        if (!this.socket?.connected) {
            throw new Error('Socket not connected');
        }
        this.socket.emit('send_message', { receiverId, content });
    }

    onMessage(handler) {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    // Typing status
    sendTypingStatus(receiverId, isTyping) {
        if (!this.socket?.connected) return;
        this.socket.emit('typing', { receiverId, isTyping });
    }

    onTyping(handler) {
        this.typingHandlers.add(handler);
        return () => this.typingHandlers.delete(handler);
    }

    // Read receipts
    markAsRead(messageId) {
        if (!this.socket?.connected) return;
        this.socket.emit('mark_read', { messageId });
    }

    onMessageRead(handler) {
        this.readHandlers.add(handler);
        return () => this.readHandlers.delete(handler);
    }

    // Notifications
    onNotification(handler) {
        this.notificationHandlers.add(handler);
        return () => this.notificationHandlers.delete(handler);
    }
}

export const socketService = new SocketService(); 