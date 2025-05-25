import React, { useState, useEffect } from 'react';
import { socketService } from '../../services/socketService';
import { useTranslation } from 'react-i18next';
import { FaBell, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { useChat } from '../../context/ChatContext';

const NotificationCenter = ({ setShowChat, setActiveChatUser }) => {
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { openChatWithUser } = useChat();

    useEffect(() => {
        // Connect to socket when component mounts
        socketService.connect();

        // Load previous notifications
        loadNotifications();

        // Set up notification listener
        const unsubscribe = socketService.onNotification((notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        await markAsRead(notification._id);
        if (notification.type === 'message' && notification.relatedId && notification.sender) {
            // Open chat window and select the sender
            if (setShowChat && setActiveChatUser) {
                setActiveChatUser(notification.sender);
                setShowChat(true);
            } else if (openChatWithUser) {
                openChatWithUser(notification.sender);
            }
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
                <FaBell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{t('notifications.title')}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-500 hover:text-blue-700"
                            >
                                {t('notifications.markAllRead')}
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {t('notifications.noNotifications')}
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.content}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter; 