import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { FaComments, FaTimes, FaPaperPlane, FaCheck, FaCheckDouble, FaClock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ChatList from './ChatList';

const ChatWidget = () => {
    const { userStatus, fetchUserStatus } = useChat();

    return null;
};

export default ChatWidget; 