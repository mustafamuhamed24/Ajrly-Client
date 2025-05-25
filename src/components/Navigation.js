import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaBell, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Only fetch notifications if user is logged in
        if (user) {
            fetchNotifications();
            // Set up polling for new notifications
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
            return () => clearInterval(interval);
        }
    }, [user]); // Add user as dependency

    const fetchNotifications = async () => {
        if (!user) return; // Don't fetch if no user is logged in

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Clear notifications on error
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
        navigate('/login', { replace: true });
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
            setNotifications(notifications.map(n =>
                n._id === notificationId ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and main navigation */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0">
                            <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
                        </Link>
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <Link to="/" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                                Home
                            </Link>
                            <Link to="/properties" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                                Properties
                            </Link>
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right side navigation */}
                    <div className="flex items-center">
                        {/* Notifications - only show when logged in */}
                        {user && (
                            <div className="relative ml-3">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="p-2 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none"
                                >
                                    <FaBell className="h-6 w-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notifications dropdown */}
                                {isNotificationsOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            {notifications.length > 0 ? (
                                                notifications.map(notification => (
                                                    <div
                                                        key={notification._id}
                                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                                            }`}
                                                        onClick={() => markNotificationAsRead(notification._id)}
                                                    >
                                                        <p className="text-sm text-gray-900">{notification.message}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="px-4 py-3 text-sm text-gray-500">No notifications</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User menu */}
                        <div className="hidden md:ml-4 md:flex md:items-center">
                            {user ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                                    >
                                        <FaUser className="mr-2" />
                                        {user.name}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-4 text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                                    >
                                        <FaSignOutAlt className="mr-2" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="ml-4 text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                            >
                                {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/"
                            className="text-gray-900 hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/properties"
                            className="text-gray-900 hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Properties
                        </Link>
                        {user?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="text-gray-900 hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Admin
                            </Link>
                        )}
                        {user ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="text-gray-900 hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-gray-900 hover:text-gray-500 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-900 hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="text-gray-900 hover:text-gray-500 block px-3 py-2 rounded-md text-base font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation; 