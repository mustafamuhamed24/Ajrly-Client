import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { FaComments, FaTimes, FaPaperPlane, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ChatList from './ChatList';

const ChatWidget = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    chats,
    currentChat,
    loading,
    error,
    unreadCount,
    createOrGetChat,
    sendMessage,
    setActiveChat,
    fetchChats
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    const openChat = () => setIsOpen(true);
    window.addEventListener('openChatWidget', openChat);

    // New: Close chat on notification, language, or navbar actions
    const closeChat = () => setIsOpen(false);
    window.addEventListener('notification:open', closeChat);
    window.addEventListener('language:change', closeChat);
    window.addEventListener('navbar:open', closeChat);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('openChatWidget', openChat);
      window.removeEventListener('notification:open', closeChat);
      window.removeEventListener('language:change', closeChat);
      window.removeEventListener('navbar:open', closeChat);
    };
  }, []);

  useEffect(() => {
    const openChat = () => setIsOpen(true);
    window.addEventListener('openChatWidget', openChat);
    return () => window.removeEventListener('openChatWidget', openChat);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [currentChat?.messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    try {
      await sendMessage(currentChat._id, message);
      setMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartChat = async (property) => {
    try {
      await createOrGetChat(property._id, property.owner._id);
      setSelectedProperty(property);
      setIsOpen(true);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    if (isMobile) {
      // On mobile, show only the chat messages when a chat is selected
      document.querySelector('.chat-list-container').classList.add('hidden');
      document.querySelector('.chat-messages-container').classList.remove('hidden');
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      document.querySelector('.chat-list-container').classList.remove('hidden');
      document.querySelector('.chat-messages-container').classList.add('hidden');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  console.log('user:', user);

  if (currentChat) {
    console.log('currentChat.participants:', currentChat.participants, 'user.id:', user._id);
  }

  // Desktop/tablet chat button (always visible when closed)
  const chatButton = (
    <button
      onClick={() => setIsOpen(true)}
      className="bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:bg-blue-700 transition-colors fixed bottom-6 right-6 z-[1000] border-4 border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Open chat"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
    >
      <FaComments className="text-3xl" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center border-2 border-white shadow">
          {unreadCount}
        </span>
      )}
    </button>
  );

  // Only render the chat overlay/container when open
  if (!isOpen) {
    // On desktop/tablet, show the chat button
    if (!isMobile) return chatButton;
    // On mobile, render nothing when closed
    return null;
  }

  return (
    <div
      className={
        `z-50 fixed ${isMobile
          ? 'inset-0 w-full h-full max-w-full max-h-full rounded-none shadow-none bg-white'
          : 'bottom-4 right-4 w-full max-w-lg sm:w-96 md:w-[480px] lg:w-[400px] h-[70vh] sm:h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200'
        } flex flex-col transition-all duration-300`
      }
      style={{
        ...(isMobile ? { minHeight: '100vh', minWidth: '100vw' } : {})
      }}
    >
      {/* Chat Window */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-2xl shadow-sm sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            {isMobile && currentChat && (
              <button
                onClick={handleBackToList}
                className="mr-2 text-white hover:text-gray-200 focus:outline-none"
                aria-label="Back to chat list"
              >
                <FaTimes className="transform rotate-180" />
              </button>
            )}
            <h3 className="font-bold text-lg tracking-wide drop-shadow">{t('Chat')}</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close chat"
          >
            <FaTimes />
          </button>
        </div>

        {/* Chat List / Messages */}
        <div className={`flex-1 overflow-hidden flex bg-gray-50 rounded-b-2xl ${isMobile ? 'flex-col' : ''}`}>
          {/* Chat List */}
          <div className={`chat-list-container ${isMobile ? 'w-full h-1/2 border-b border-gray-200' : 'w-full sm:w-1/3 border-r border-gray-200'} overflow-y-auto bg-white ${isMobile && currentChat ? 'hidden' : ''}`}>
            <ChatList onSelectChat={handleChatSelect} />
          </div>

          {/* Messages */}
          <div className={`chat-messages-container flex-1 flex flex-col ${isMobile && !currentChat ? 'hidden' : ''} bg-gray-50`}>
            {currentChat ? (
              <>
                {/* Chat Header (Participant) */}
                <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3 sticky top-0 z-10">
                  {(() => {
                    const otherParticipant = currentChat.participants.find(p => String(p._id) !== String(user._id));
                    return (
                      <>
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <img
                            src={otherParticipant?.avatar || '/default-avatar.png'}
                            alt={otherParticipant?.name}
                            className="w-full h-full rounded-full object-cover border-2 border-blue-200 shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 truncate text-base">
                            {otherParticipant?.name || 'Unknown User'}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {currentChat.property?.title || ''}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentChat.messages && currentChat.messages.length > 0 ? (
                    currentChat.messages.map((msg, index) => {
                      const isSentByMe = msg.sender && msg.sender._id === user._id;
                      const senderAvatar = msg.sender?.avatar || '/default-avatar.png';
                      const senderName = msg.sender?.name || 'Unknown User';
                      return (
                        <div
                          key={msg._id || index}
                          className={`flex items-end gap-2 ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isSentByMe && (
                            <img
                              src={senderAvatar}
                              alt={senderName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                          )}
                          <div className={`flex flex-col max-w-[75%] ${isSentByMe ? 'items-end' : 'items-start'}`}>
                            {!isSentByMe && (
                              <span className="text-xs text-gray-500 font-semibold mb-1">{senderName}</span>
                            )}
                            <div
                              className={`p-3 rounded-2xl shadow-sm text-sm ${isSentByMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'}`}
                            >
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <span>{formatTime(msg.createdAt)}</span>
                              {isSentByMe && (
                                <span title={msg.read ? 'Read' : 'Sent'}>
                                  {msg.read ? (
                                    <FaCheckDouble className="inline text-blue-500" />
                                  ) : (
                                    <FaCheckDouble className="inline text-gray-400" style={{ filter: 'blur(1px)' }} />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSentByMe && (
                            <img
                              src={senderAvatar}
                              alt={senderName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      {t('No messages yet. Start the conversation!')}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2 p-3 bg-white border-t border-gray-200 rounded-b-2xl">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('Type a message...')}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-400 bg-gray-50 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={!message.trim()}
                    aria-label="Send message"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-base">
                {t('Select a chat to start messaging')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget; 