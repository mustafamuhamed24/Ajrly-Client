import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'message':
                return '💬';
            case 'booking_request':
                return '📝';
            case 'booking_approved':
                return '✅';
            case 'booking_rejected':
                return '❌';
            default:
                return '🔔';
        }
    };

    const getNotificationTitle = (notification) => {
        switch (notification.type) {
            case 'message':
                return `New message from ${notification.sender}`;
            case 'booking_request':
                return 'New booking request';
            case 'booking_approved':
                return 'Booking approved';
            case 'booking_rejected':
                return 'Booking rejected';
            default:
                return notification.title || 'New notification';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Notifications</h3>
                            <div className="space-x-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Mark all as read
                                </button>
                                <button
                                    onClick={clearNotifications}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Clear all
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start">
                                        <span className="text-2xl mr-3">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {getNotificationTitle(notification)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {notification.content}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {format(new Date(notification.timestamp), 'PPp', { locale: ar })}
                                            </p>
                                        </div>
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

export default NotificationBell; 