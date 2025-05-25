import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../../services/socketService';
import { useTranslation } from 'react-i18next';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';

const ChatWindow = ({ receiver, onClose }) => {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        // Connect to socket when component mounts
        socketService.connect();

        // Load previous messages
        loadMessages();

        // Set up message listener
        const unsubscribe = socketService.onMessage((data) => {
            if (data.sender._id === receiver._id) {
                setMessages(prev => [...prev, data.message]);
                socketService.markAsRead(data.message._id);
            }
        });

        // Set up typing listener
        const unsubscribeTyping = socketService.onTyping((data) => {
            if (data.userId === receiver._id) {
                setIsTyping(data.isTyping);
            }
        });

        return () => {
            unsubscribe();
            unsubscribeTyping();
        };
    }, [receiver._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/chat/${receiver._id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = () => {
        socketService.sendTypingStatus(receiver._id, true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            socketService.sendTypingStatus(receiver._id, false);
        }, 2000);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            socketService.sendMessage(receiver._id, newMessage.trim());
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                    <img
                        src={receiver.avatar || '/default-avatar.png'}
                        alt={receiver.name}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <h3 className="text-lg font-semibold">{receiver.name}</h3>
                        {isTyping && (
                            <p className="text-sm text-gray-500">{t('chat.typing')}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id}
                            className={`flex ${message.sender === receiver._id ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${message.sender === receiver._id
                                        ? 'bg-gray-100'
                                        : 'bg-blue-500 text-white'
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs mt-1 opacity-70">
                                    {format(new Date(message.createdAt), 'HH:mm')}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleTyping}
                        placeholder={t('chat.typeMessage')}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none disabled:opacity-50"
                    >
                        <FaPaperPlane />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow; 