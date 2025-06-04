import React, { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { FaCircle } from 'react-icons/fa';

const ChatList = ({ onSelectChat }) => {
    const { chats, currentChat, unreadCount, userStatus, fetchUserStatus } = useChat();
    const { user } = useAuth();
    const { t } = useTranslation();

    const getLastMessage = (chat) => {
        if (!chat.messages || chat.messages.length === 0) {
            return t('No messages yet');
        }
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage.content;
    };

    const getUnreadCount = (chat) => {
        if (!chat?.messages || !Array.isArray(chat.messages)) return 0;
        return chat.messages.filter(m =>
            m && !m.read && m.sender && m.sender._id && m.sender._id !== user?.id
        ).length;
    };

    const formatTime = (date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    const getOtherParticipant = (chat) => {
        if (!chat?.participants || !Array.isArray(chat.participants)) return null;
        return chat.participants.find(p => p._id !== user?.id);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (name) => {
        if (!name) return 'bg-gray-400';
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-yellow-500',
            'bg-red-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
        ];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    // Fetch user status for all chat participants on mount or when chats change
    useEffect(() => {
        if (chats && chats.length > 0) {
            const userIds = chats.map(chat => {
                const other = chat.participants.find(p => p._id !== user._id && p.id !== user.id);
                return other?._id || other?.id;
            }).filter(Boolean);
            fetchUserStatus(userIds);
        }
    }, [chats]);

    return (
        <div className="chat-list p-2">
            <h3 className="text-lg font-semibold mb-4 px-2">{t('Chats')}</h3>
            {chats.length === 0 ? (
                <p className="text-gray-500 px-2">{t('No chats yet')}</p>
            ) : (
                <div className="space-y-1">
                    {chats.map((chat) => {
                        const unread = getUnreadCount(chat);
                        const otherParticipant = getOtherParticipant(chat);
                        const lastMessage = getLastMessage(chat);
                        const initials = getInitials(otherParticipant?.name);
                        const avatarColor = getAvatarColor(otherParticipant?.name);

                        return (
                            <div
                                key={chat._id}
                                onClick={() => onSelectChat(chat)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${currentChat?._id === chat._id
                                    ? 'bg-blue-100'
                                    : 'hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="relative flex-shrink-0">
                                        {otherParticipant?.avatar ? (
                                            <img
                                                src={otherParticipant.avatar}
                                                alt={otherParticipant.name}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '';
                                                    e.target.classList.add('hidden');
                                                    e.target.nextElementSibling.classList.remove('hidden');
                                                }}
                                            />
                                        ) : (
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm sm:text-base`}>
                                                {initials}
                                            </div>
                                        )}
                                        {unread > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                                {unread}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium truncate text-sm sm:text-base">{otherParticipant?.name}</h4>
                                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                {formatTime(chat.updatedAt)}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                                            {lastMessage}
                                        </p>
                                    </div>
                                </div>
                                {otherParticipant && (
                                    <span className="ml-2 text-xs">
                                        {userStatus[otherParticipant._id || otherParticipant.id]?.online ? (
                                            <span className="text-green-500">● Online</span>
                                        ) : userStatus[otherParticipant._id || otherParticipant.id]?.lastSeen ? (
                                            <span className="text-gray-400">Last seen: {new Date(userStatus[otherParticipant._id || otherParticipant.id].lastSeen).toLocaleString()}</span>
                                        ) : null}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatList; 