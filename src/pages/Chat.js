import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ChatList from '../components/ChatList';
import { socketService } from '../services/socketService';

const Chat = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const {
        chats,
        currentChat,
        sendMessage,
        setActiveChat,
        fetchChats,
        userStatus,
        fetchUserStatus
    } = useChat();

    // Log the user object for debugging
    console.log('Current user:', user);
    console.log('Chat.js: userStatus', userStatus);

    const [message, setMessage] = useState('');
    const [showChatList, setShowChatList] = useState(true); // for mobile
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Responsive: show chat list or chat area on mobile
    const isMobile = window.innerWidth < 768;

    useEffect(() => {
        fetchChats();

        // Connect to socket
        socketService.connect();

        // Listen for new messages
        const unsubscribe = socketService.onMessage((data) => {
            console.log('New message received:', data);

            // Use currentChat from context directly
            if (currentChat && data.chatId === currentChat._id) {
                setActiveChat(prev => {
                    if (!prev) return null;
                    const updatedMessages = [...(prev.messages || []), data.message];
                    return {
                        ...prev,
                        messages: updatedMessages,
                        lastMessage: data.message.createdAt
                    };
                });
                // Mark as read if the user is viewing the chat and the message is not from the current user
                const senderId = typeof data.message.sender === 'object' ? (data.message.sender._id || data.message.sender.id) : data.message.sender;
                const userId = user?._id || user?.id;
                if (String(senderId) !== String(userId)) {
                    socketService.markAsRead(data.message._id);
                }
            }

            // Update chat list
            fetchChats();
        });

        // Listen for read receipts
        const unsubscribeRead = socketService.onMessageRead((data) => {
            setActiveChat(prev => {
                if (!prev) return null;
                const updatedMessages = (prev.messages || []).map(msg =>
                    msg._id === data.messageId ? { ...msg, read: true } : msg
                );
                return {
                    ...prev,
                    messages: updatedMessages
                };
            });
        });

        return () => {
            unsubscribe();
            unsubscribeRead();
        };
    }, [user?._id, user?.id, currentChat, fetchChats, setActiveChat]);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [currentChat?.messages]);

    // When a chat is selected, hide chat list on mobile
    const handleChatSelect = (chat) => {
        setActiveChat(chat);
        if (isMobile) setShowChatList(false);
    };

    // Back button for mobile
    const handleBack = () => {
        setShowChatList(true);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !currentChat) return;

        // Store message and clear input immediately
        const messageToSend = message.trim();
        setMessage(''); // Clear input immediately for better UX

        try {
            await sendMessage(currentChat._id, messageToSend);
            // No need to manually update UI as socket will handle it
        } catch (error) {
            console.error('Failed to send message:', error);
            // If message fails to send, restore the message in the input
            setMessage(messageToSend);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Get the other participant's info for the chat header
    const getOtherParticipant = () => {
        if (!currentChat || !user) return null;
        return currentChat.participants.find(p => p._id !== user._id && p.id !== user.id);
    };
    const other = getOtherParticipant();
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };
    const getAvatarColor = (name) => {
        if (!name) return 'bg-gray-400';
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
        ];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    // Fetch user status when chat changes
    useEffect(() => {
        if (currentChat && currentChat.participants) {
            const other = currentChat.participants.find(p => p._id !== user._id && p.id !== user.id);
            if (other) {
                fetchUserStatus([other._id || other.id]);
            }
        }
    }, [currentChat]);

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50">
            {/* Sidebar Chat List */}
            <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 overflow-y-auto ${isMobile && !showChatList ? 'hidden' : ''}`}>
                <ChatList onSelectChat={handleChatSelect} />
            </div>
            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col ${isMobile && showChatList ? 'hidden' : ''} bg-white border-l border-gray-200`} style={{ height: isMobile ? 'calc(100vh - 4rem)' : 'calc(100vh - 4rem)' }}>
                {isMobile && !showChatList && (
                    <button onClick={handleBack} className="p-2 text-blue-600 font-medium bg-white border-b w-full text-left">&larr; {t('Back to chats')}</button>
                )}
                {currentChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-white flex items-center gap-3">
                            {other && (
                                other.avatar ? (
                                    <img
                                        src={other.avatar}
                                        alt={other.name}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        loading="lazy"
                                        onError={e => {
                                            e.target.onerror = null;
                                            e.target.src = '';
                                            e.target.classList.add('hidden');
                                            e.target.nextElementSibling.classList.remove('hidden');
                                        }}
                                    />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(other.name)} flex items-center justify-center text-white font-semibold text-base`}>
                                        {getInitials(other.name)}
                                    </div>
                                )
                            )}
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg text-gray-800 truncate">{other?.name || t('Chat')}</span>
                                {userStatus[other._id || other.id]?.online ? (
                                    <span className="ml-2 text-green-500 text-xs">● Online</span>
                                ) : userStatus[other._id || other.id]?.lastSeen ? (
                                    <span className="ml-2 text-gray-400 text-xs">Last seen: {new Date(userStatus[other._id || other.id].lastSeen).toLocaleString()}</span>
                                ) : (
                                    <span className="ml-2 text-gray-300 text-xs">Status unknown</span>
                                )}
                            </div>
                        </div>
                        {/* Messages */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-2 pb-0 space-y-2 bg-gray-50">
                            {currentChat.messages && currentChat.messages.length > 0 ? (
                                currentChat.messages.map((msg, idx) => {
                                    if (!msg.sender || (!msg.sender._id && !msg.sender.id && typeof msg.sender !== 'string')) {
                                        // Skip messages with undefined sender
                                        return null;
                                    }
                                    console.log('msg.sender:', msg.sender, 'user._id:', user._id, 'user.id:', user.id);
                                    const senderId = typeof msg.sender === 'object'
                                        ? (msg.sender._id || msg.sender.id)
                                        : msg.sender;
                                    const userId = user?._id || user?.id;
                                    const isOwn = String(senderId) === String(userId);
                                    if (!isOwn && idx === currentChat.messages.length - 1) {
                                        console.warn('Alignment mismatch: senderId', senderId, 'userId', userId);
                                    }
                                    const sender = isOwn ? user : other;
                                    const initials = getInitials(sender?.name);
                                    const avatarColor = getAvatarColor(sender?.name);
                                    // Detect RTL (for Arabic)
                                    const isRTL = /[\u0000-\u007F]+/.test(msg.content) ? false : true;
                                    return (
                                        <div key={msg._id || idx} className={`flex items-end ${isOwn ? 'justify-end' : 'justify-start'} w-full`}>
                                            {isOwn ? (
                                                // Do not render avatar or initials for sent messages
                                                null
                                            ) : (
                                                <div className="flex-shrink-0 mr-2">
                                                    {sender?.avatar ? (
                                                        <img
                                                            src={sender.avatar}
                                                            alt={sender.name}
                                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-xs`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'} ${isRTL ? 'text-right' : ''}`}
                                                style={{ wordBreak: 'break-word', direction: isRTL ? 'rtl' : 'ltr' }}>
                                                <div>{msg.content}</div>
                                                <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                                                    <span>{formatTime(msg.createdAt)}</span>
                                                    {isOwn && (
                                                        <span>
                                                            {msg.read ? <FaCheckDouble className="inline" /> : <FaCheck className="inline" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-gray-400 text-center mt-8">{t('No messages yet. Start the conversation!')}</div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="flex gap-2 px-2 py-2 bg-white border-t">
                            <input
                                type="text"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder={t('Type a message...')}
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-400 bg-gray-50"
                                style={{ minWidth: 0 }}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 shadow-md focus:outline-none"
                                disabled={!message.trim()}
                                aria-label="Send message"
                            >
                                <FaPaperPlane />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                        {t('Select a chat to start messaging')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat; 