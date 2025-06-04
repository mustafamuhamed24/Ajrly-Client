import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import { toast } from 'react-hot-toast';
import { socketService } from '../services/socketService';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [userStatus, setUserStatus] = useState({});

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
                    _id: user._id,
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
                    _id: user._id,
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

    // Real-time: Listen for new messages via socket and update chat state
    useEffect(() => {
        const unsubscribe = socketService.onMessage((data) => {
            // Update the chat in the chats list
            setChats(prevChats => {
                return prevChats.map(chat => {
                    if (chat._id === data.chatId) {
                        return {
                            ...chat,
                            messages: [...(chat.messages || []), data.message],
                            lastMessage: data.message.createdAt
                        };
                    }
                    return chat;
                });
            });
            // If the current chat is open, update it too
            setCurrentChat(prev => {
                if (prev && prev._id === data.chatId) {
                    return {
                        ...prev,
                        messages: [...(prev.messages || []), data.message],
                        lastMessage: data.message.createdAt
                    };
                }
                return prev;
            });
            // Show notification if the chat is not open and the message is not from the current user
            if (!currentChat || currentChat._id !== data.chatId) {
                const senderId = typeof data.message.sender === 'object' ? (data.message.sender._id || data.message.sender.id) : data.message.sender;
                const userId = user?._id || user?.id;
                if (String(senderId) !== String(userId)) {
                    toast.success(`New message from ${data.message.sender.name || 'User'}`);
                    setUnreadCount(prev => prev + 1);
                    // Add to notifications array
                    setNotifications(prev => [
                        {
                            id: data.message._id,
                            chatId: data.chatId,
                            sender: data.message.sender.name || 'User',
                            content: data.message.content,
                            createdAt: data.message.createdAt
                        },
                        ...prev
                    ]);
                }
            }
        });
        return () => unsubscribe();
    }, [currentChat, user]);

    useEffect(() => {
        socketService.connect();
        const handleUserOnline = ({ userId }) => {
            setUserStatus(prev => ({
                ...prev,
                [userId]: { online: true, lastSeen: null }
            }));
        };
        const handleUserOffline = ({ userId, lastSeen }) => {
            setUserStatus(prev => ({
                ...prev,
                [userId]: { online: false, lastSeen }
            }));
        };
        if (socketService.socket) {
            socketService.socket.on('user_online', handleUserOnline);
            socketService.socket.on('user_offline', handleUserOffline);
        }
        return () => {
            if (socketService.socket) {
                socketService.socket.off('user_online', handleUserOnline);
                socketService.socket.off('user_offline', handleUserOffline);
            }
        };
    }, []);

    // Fetch user status for a list of userIds
    const fetchUserStatus = async (userIds) => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userIds })
            });
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response type');
            }
            const data = await res.json();
            setUserStatus(prev => {
                const updated = { ...prev };
                data.forEach(({ userId, online, lastSeen }) => {
                    updated[userId] = { online, lastSeen };
                });
                return updated;
            });
        } catch (error) {
            console.error('Error fetching user status:', error);
            // Fallback: set all requested userIds to unknown
            setUserStatus(prev => {
                const updated = { ...prev };
                userIds.forEach(userId => {
                    updated[userId] = { online: false, lastSeen: null };
                });
                return updated;
            });
        }
    };

    // Poll for new messages (fallback, every 5 minutes instead of 30 seconds)
    /*
    useEffect(() => {
        if (!user || !token) return;

        fetchChats();
        const interval = setInterval(fetchChats, 300000); // Poll every 5 minutes

        return () => clearInterval(interval);
    }, [user, token]);
    */

    // Function to clear notifications
    const clearNotifications = () => setNotifications([]);

    const value = {
        chats,
        currentChat,
        loading,
        error,
        unreadCount,
        createOrGetChat,
        sendMessage,
        setActiveChat,
        fetchChats,
        notifications,
        clearNotifications,
        userStatus,
        fetchUserStatus
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}; 