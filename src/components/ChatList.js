import React from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { FaCircle } from 'react-icons/fa';

const ChatList = ({ onSelectChat }) => {
    const { chats, currentChat, unreadCount } = useChat();
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

                        return (
                            <div
                                key={chat._id}
                                onClick={() => onSelectChat(chat)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${currentChat?._id === chat._id
                                    ? 'bg-blue-100'
                                    : 'hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={otherParticipant?.avatar || '/default-avatar.png'}
                                                alt={otherParticipant?.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-avatar.png';
                                                }}
                                            />
                                            {unread > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {unread}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium truncate">{otherParticipant?.name}</h4>
                                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                    {formatTime(chat.updatedAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                {lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatList; 