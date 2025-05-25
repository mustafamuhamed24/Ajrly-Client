import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBell, FaComments } from 'react-icons/fa';
import { useChat } from '../context/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationMenu = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const { chats, unreadCount, setActiveChat } = useChat();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getUnreadChats = () => {
        return chats.filter(chat =>
            chat.messages.some(m => !m.read && m.sender._id !== chat.participants[0]._id)
        );
    };

    const handleChatClick = (chat) => {
        setActiveChat(chat);
        setIsOpen(false);
    };

    const unreadChats = getUnreadChats();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800"
            >
                <FaBell className="text-xl" />
                {(unreadCount > 0) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold">{t('Notifications')}</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {unreadChats.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {t('No new notifications')}
                            </div>
                        ) : (
                            <div>
                                {unreadChats.map(chat => {
                                    const lastMessage = chat.messages[chat.messages.length - 1];
                                    const otherParticipant = chat.participants.find(p => p._id !== chat.participants[0]._id);

                                    return (
                                        <div
                                            key={chat._id}
                                            onClick={() => handleChatClick(chat)}
                                            className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <FaComments className="text-blue-500 text-xl" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {otherParticipant?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {lastMessage.content}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationMenu; 