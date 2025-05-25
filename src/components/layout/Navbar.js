import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    Bars3Icon,
    XMarkIcon,
    BellIcon,
    UserCircleIcon,
    HomeIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    GlobeAltIcon,
    LanguageIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import API_BASE_URL from '../../config/apiConfig';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const profileRef = useRef(null);
    const notificationsRef = useRef(null);
    const languageRef = useRef(null);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
        setIsLanguageMenuOpen(false);
    };

    useEffect(() => {
        // Set initial direction based on current language
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    useEffect(() => {
        // Fetch notifications when user is logged in
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response type');
            }
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            setNotifications([]);
            console.error('Error fetching notifications:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setIsUserMenuOpen(false);
            setIsNotificationsOpen(false);
            setIsLanguageMenuOpen(false);
            setIsOpen(false);
            toast.success('Logged out successfully');
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed. Please try again.');
        }
    };

    const handleProfileImageUpload = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await fetch(`${API_BASE_URL}/users/me/profile-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            if (data.profileImage) {
                // Update user context or state with new profile image
                toast.success('Profile image updated successfully');
            }
        } catch (error) {
            console.error('Error uploading profile image:', error);
            toast.error('Failed to upload profile image');
        }
    };

    const navigation = [
        { name: t('home'), href: '/', icon: HomeIcon },
        { name: t('properties.list'), href: '/properties', icon: BuildingOfficeIcon },
        { name: t('bookings'), href: '/bookings', icon: CalendarIcon },
        { name: t('dashboard.title'), href: '/admin', icon: ChartBarIcon }
    ];
    const fullNavigation = [...navigation];

    // Close other dropdowns when one is opened
    const handleDropdownToggle = (dropdown) => {
        switch (dropdown) {
            case 'profile':
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsNotificationsOpen(false);
                setIsLanguageMenuOpen(false);
                break;
            case 'notifications':
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsUserMenuOpen(false);
                setIsLanguageMenuOpen(false);
                break;
            case 'language':
                setIsLanguageMenuOpen(!isLanguageMenuOpen);
                setIsUserMenuOpen(false);
                setIsNotificationsOpen(false);
                break;
            default:
                break;
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
            if (languageRef.current && !languageRef.current.contains(event.target)) {
                setIsLanguageMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and main navigation */}
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img src="/Logo.png" alt="أجرلى" className="h-16 w-auto" />
                        </Link>
                        <div className="hidden sm:ml-16 sm:flex sm:space-x-8">
                            {fullNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                                >
                                    <item.icon className={`h-5 w-5 ${i18n.language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-4">
                        {/* Language Toggle */}
                        <Menu as="div" className="relative" ref={languageRef}>
                            <Menu.Button
                                className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <GlobeAltIcon className="h-6 w-6" />
                            </Menu.Button>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className={`origin-top-right absolute ${i18n.language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}>
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => changeLanguage('en')}
                                                    className={`${active ? 'bg-gray-100' : ''
                                                        } ${i18n.language === 'en' ? 'text-primary-600 bg-primary-50' : 'text-gray-700'
                                                        } block w-full text-left px-4 py-2 text-sm`}
                                                >
                                                    {t('english')}
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => changeLanguage('ar')}
                                                    className={`${active ? 'bg-gray-100' : ''
                                                        } ${i18n.language === 'ar' ? 'text-primary-600 bg-primary-50' : 'text-gray-700'
                                                        } block w-full text-left px-4 py-2 text-sm`}
                                                >
                                                    {t('arabic')}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>

                        {/* Notifications - Only show when user is authenticated */}
                        {user && (
                            <Menu as="div" className="relative" ref={notificationsRef}>
                                <Menu.Button
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <span className="sr-only">View notifications</span>
                                    <BellIcon className="h-6 w-6" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                                    )}
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className={`origin-top-right absolute ${i18n.language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}>
                                        <div className="py-1">
                                            {notifications.length > 0 ? (
                                                notifications.map((notification) => (
                                                    <Menu.Item key={notification._id}>
                                                        {({ active }) => (
                                                            <div
                                                                className={`${active ? 'bg-gray-50' : ''
                                                                    } px-4 py-2 cursor-pointer`}
                                                            >
                                                                <p className="text-sm text-gray-900">{notification.message}</p>
                                                                <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        )}
                                                    </Menu.Item>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">{t('notifications.noNotifications')}</div>
                                            )}
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        )}

                        {/* User menu - Only show when user is authenticated */}
                        {user ? (
                            <Menu as="div" className="relative" ref={profileRef}>
                                <Menu.Button
                                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 focus:outline-none"
                                >
                                    <UserCircleIcon className="h-8 w-8" />
                                    <span className="text-sm font-medium">{user.name}</span>
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                        <div className="py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/admin"
                                                        className={`${active ? 'bg-gray-100' : ''
                                                            } block px-4 py-2 text-sm text-gray-700`}
                                                    >
                                                        {t('dashboard.title')}
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/profile"
                                                        className={`${active ? 'bg-gray-100' : ''
                                                            } block px-4 py-2 text-sm text-gray-700`}
                                                    >
                                                        {t('profile.myProfile')}
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/settings"
                                                        className={`${active ? 'bg-gray-100' : ''
                                                            } block px-4 py-2 text-sm text-gray-700`}
                                                    >
                                                        {t('profile.settings')}
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/security"
                                                        className={`${active ? 'bg-gray-100' : ''
                                                            } block px-4 py-2 text-sm text-gray-700`}
                                                    >
                                                        {t('profile.security')}
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/help"
                                                        className={`${active ? 'bg-gray-100' : ''
                                                            } block px-4 py-2 text-sm text-gray-700`}
                                                    >
                                                        {t('profile.help')}
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <div className="border-t border-gray-100"></div>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${active ? 'bg-gray-100' : ''
                                                            } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                                    >
                                                        <ArrowRightOnRectangleIcon className={`h-5 w-5 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                                        {t('profile.logout')}
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    {t('signIn')}
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    {t('signUp')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <XMarkIcon className="block h-6 w-6" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {fullNavigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                            >
                                <item.icon className={`h-5 w-5 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    {user ? (
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="flex items-center px-4">
                                <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                <div className={`${i18n.language === 'ar' ? 'mr-3' : 'ml-3'}`}>
                                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <Link
                                    to="/admin"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('dashboard.title')}
                                </Link>
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('profile.myProfile')}
                                </Link>
                                <button
                                    onClick={() => { setIsOpen(false); handleLogout(); }}
                                    className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                >
                                    <ArrowRightOnRectangleIcon className={`h-5 w-5 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                    {t('profile.logout')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('signIn')}
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-base font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('signUp')}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar; 