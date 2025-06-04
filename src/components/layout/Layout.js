import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ChatWidget from '../ChatWidget';
import Footer from '../Footer';

const Layout = ({ children }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const isChatPage = location.pathname === '/chat';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            {!isChatPage && <Footer />}
            <ChatWidget />
        </div>
    );
};

export default Layout; 