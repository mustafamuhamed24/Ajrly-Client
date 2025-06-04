import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socketService';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Connect to socket when component mounts
        socketService.connect();

        // Handle new notifications
        const unsubscribe = socketService.onNotification((notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            switch (notification.type) {
                case 'message':
                    toast.success(`New message from ${notification.sender}`);
                    break;
                case 'booking_request':
                    toast.success('New booking request received');
                    break;
                case 'booking_approved':
                    toast.success('Your booking has been approved');
                    break;
                case 'booking_rejected':
                    toast.error('Your booking request was rejected');
                    break;
                default:
                    toast.success(notification.content);
            }
        });

        // Cleanup on unmount
        return () => {
            unsubscribe();
            socketService.disconnect();
        };
    }, []);

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 