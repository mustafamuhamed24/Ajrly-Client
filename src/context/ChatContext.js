import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import { toast } from 'react-hot-toast';
import { io as socketIOClient } from 'socket.io-client';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    // Fetch all chats for the current user
    const fetchChats = async () => {
        if (!user || !token) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CHAT.LIST}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setChats(response.data);

            // Calculate unread messages: only messages not sent by the user and not read
            const unread = response.data.reduce((count, chat) => {
                if (!Array.isArray(chat.messages)) return count;
                return count + chat.messages.filter(m =>
                    !m.read && m.sender && m.sender._id !== user.id
                ).length;
            }, 0);
            setUnreadCount(unread);
        } catch (err) {
            console.error('Error fetching chats:', err);
            setError(err.response?.data?.message || 'Error fetching chats');
        } finally {
            setLoading(false);
        }
    };

    // Create or get a chat
    const createOrGetChat = async (propertyId, ownerId) => {
        if (!token) throw new Error('No authentication token available');

        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CHAT.CREATE}`, {
                propertyId,
                ownerId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update chats list
            const existingChatIndex = chats.findIndex(c => c._id === response.data._id);
            if (existingChatIndex >= 0) {
                setChats(prev => [
                    response.data,
                    ...prev.filter((_, i) => i !== existingChatIndex)
                ]);
            } else {
                setChats(prev => [response.data, ...prev]);
            }

            setCurrentChat(response.data);
            return response.data;
        } catch (err) {
            console.error('Error creating chat:', err);
            setError(err.response?.data?.message || 'Error creating chat');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Send a message
    const sendMessage = async (chatId, content) => {
        if (!token || !user) throw new Error('No authentication token or user available');

        try {
            // Optimistically update the UI
            const optimisticMessage = {
                _id: Date.now().toString(), // Temporary ID
                content,
                sender: {
                    _id: user.id,
                    name: user.name,
                    avatar: user.avatar
                },
                read: false,
                createdAt: new Date().toISOString()
            };

            // Update current chat optimistically
            setCurrentChat(prev => ({
                ...prev,
                messages: [...(prev?.messages || []), optimisticMessage]
            }));

            // Update chats list optimistically
            setChats(prev => prev.map(chat =>
                chat._id === chatId
                    ? {
                        ...chat,
                        messages: [...(chat.messages || []), optimisticMessage],
                        lastMessage: new Date()
                    }
                    : chat
            ));

            // Send message to server
            const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CHAT.MESSAGES(chatId)}`, {
                content,
                sender: {
                    _id: user.id,
                    name: user.name,
                    avatar: user.avatar
                }
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update with server response
            setCurrentChat(response.data);
            setChats(prev => prev.map(chat =>
                chat._id === chatId ? response.data : chat
            ));

            return response.data;
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err.response?.data?.message || 'Error sending message');

            // Revert optimistic updates on error
            setCurrentChat(prev => ({
                ...prev,
                messages: prev?.messages?.filter(m => m._id !== Date.now().toString()) || []
            }));
            setChats(prev => prev.map(chat =>
                chat._id === chatId
                    ? {
                        ...chat,
                        messages: chat.messages?.filter(m => m._id !== Date.now().toString()) || []
                    }
                    : chat
            ));

            throw err;
        }
    };

    // Mark messages as read
    const markAsRead = async (chatId) => {
        if (!token) throw new Error('No authentication token available');

        try {
            const response = await axios.put(`${API_BASE_URL}${API_ENDPOINTS.CHAT.MARK_READ(chatId)}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update current chat
            setCurrentChat(response.data);

            // Update chats list
            setChats(prev => prev.map(chat =>
                chat._id === chatId ? response.data : chat
            ));

            // Update unread count
            fetchChats();
        } catch (err) {
            console.error('Error marking messages as read:', err);
            setError(err.response?.data?.message || 'Error marking messages as read');
        }
    };

    // Set current chat and mark messages as read
    const setActiveChat = async (chat) => {
        try {
            setCurrentChat(chat);
            if (chat) {
                await markAsRead(chat._id);
                // Update unread count
                setUnreadCount(prev => Math.max(0, prev - (chat.messages?.filter(m => !m.read && m.sender._id !== user.id).length || 0)));
            }
        } catch (error) {
            console.error('Error setting active chat:', error);
            setError(error.message);
        }
    };

    // Real-time: Setup Socket.IO client
    useEffect(() => {
        if (!user || !token) return;

        // Connect to Socket.IO server with authentication
        const socket = socketIOClient(API_BASE_URL.replace(/\/api.*/, ''), {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        setSocket(socket);

        // Listen for new chat messages
        socket.on('chat:newMessage', ({ chatId, chat }) => {
            setChats(prev => {
                const idx = prev.findIndex(c => c._id === chatId);
                let updated;
                if (idx >= 0) {
                    updated = [...prev];
                    updated[idx] = chat;
                } else {
                    updated = [chat, ...prev];
                }
                // Recalculate unread count
                const unread = updated.reduce((count, c) => {
                    return count + (c.messages?.filter(m =>
                        !m.read && m.sender._id !== user.id
                    ).length || 0);
                }, 0);
                setUnreadCount(unread);
                return updated;
            });

            // Update current chat if it's the active one
            setCurrentChat(prev => {
                if (prev?._id === chatId) {
                    return chat;
                }
                return prev;
            });
        });

        // Handle connection errors
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setError('Connection error. Please check your internet connection.');
        });

        // Handle reconnection
        socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            fetchChats(); // Refresh chats after reconnection
        });

        return () => {
            socket.disconnect();
        };
    }, [user, token]);

    // Poll for new messages
    useEffect(() => {
        if (!user || !token) return;

        fetchChats();
        const interval = setInterval(fetchChats, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [user, token]);

    const value = {
        chats,
        currentChat,
        loading,
        error,
        unreadCount,
        createOrGetChat,
        sendMessage,
        setActiveChat,
        fetchChats
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}; 