import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/apiConfig';

const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const Profile = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user: authUser, setUser } = useAuth();
    const [user, setUserState] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileImage, setProfileImage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef();
    const [bookings, setBookings] = useState([]);

    // Check authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProfile();
        fetchBookingStats();
    }, [navigate]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch(`${API_BASE_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch profile');
            }

            const data = await res.json();
            setUserState(data);
            setForm({
                name: data.name || '',
                email: data.email || '',
                password: ''
            });

            // Set the full URL for the profile image
            if (data.profileImage) {
                const profileImageUrl = data.profileImage.startsWith('http')
                    ? data.profileImage
                    : `${API_BASE_URL.replace('/api', '')}${data.profileImage}`;
                console.log('Setting profile image URL:', profileImageUrl);

                // Try to fetch the image first
                try {
                    const imageRes = await fetch(profileImageUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'image/*',
                            'Cache-Control': 'no-cache'
                        }
                    });

                    if (!imageRes.ok) {
                        throw new Error(`Failed to load image: ${imageRes.status} ${imageRes.statusText}`);
                    }

                    const blob = await imageRes.blob();
                    const objectUrl = URL.createObjectURL(blob);

                    // Create a new image to verify it loads
                    const img = new Image();
                    img.crossOrigin = 'anonymous';

                    img.onload = () => {
                        console.log('Profile image loaded successfully');
                        setProfileImage(objectUrl);
                        setPreviewImage(objectUrl);
                        setImageError(false);
                    };

                    img.onerror = (e) => {
                        console.error('Failed to load profile image:', e);
                        URL.revokeObjectURL(objectUrl);
                        setImageError(true);
                        setProfileImage('');
                        setPreviewImage('');
                        // Don't show error toast for missing images
                        if (imageRes.status !== 404) {
                            toast.error('Failed to load profile image');
                        }
                    };

                    img.src = objectUrl;
                } catch (error) {
                    console.error('Error fetching image:', error);
                    setImageError(true);
                    setProfileImage('');
                    setPreviewImage('');
                    // Don't show error toast for missing images
                    if (!error.message.includes('404')) {
                        toast.error('Failed to load profile image');
                    }
                }
            } else {
                setProfileImage('');
                setPreviewImage('');
                setImageError(false);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookingStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Use the correct endpoint for user bookings
            const res = await fetch(`${API_BASE_URL}/bookings/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                // If we get a 404 or 500 error, set empty bookings and show error
                if (res.status === 404 || res.status === 500) {
                    console.warn('Server error fetching bookings, setting empty state');
                    setBookings([]);
                    return;
                }
                throw new Error(`Failed to fetch bookings: ${res.status}`);
            }

            const data = await res.json();

            // Handle different response formats
            let bookingsData = [];
            if (Array.isArray(data)) {
                bookingsData = data;
            } else if (data.bookings && Array.isArray(data.bookings)) {
                bookingsData = data.bookings;
            } else if (data.data && Array.isArray(data.data)) {
                bookingsData = data.data;
            } else {
                console.warn('Unexpected bookings data format:', data);
                setBookings([]);
                return;
            }

            setBookings(bookingsData);
        } catch (error) {
            console.error('Bookings fetch error:', error);
            setBookings([]);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPG, PNG, or GIF)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
        setImageError(false);
    };

    const handleImageUpload = async () => {
        const file = fileInputRef.current.files[0];
        if (!file) {
            toast.error('Please select an image first');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPG, PNG, or GIF)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            console.log('Uploading file:', {
                name: file.name,
                type: file.type,
                size: file.size
            });

            const res = await fetch('http://localhost:5000/api/users/me/profile-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                throw new Error(data.message || data.error || 'Upload failed');
            }

            if (!data.profileImage) {
                throw new Error('No image URL in response');
            }

            // Set the full URL for the profile image
            const profileImageUrl = `${API_BASE_URL.replace('/api', '')}${data.profileImage}`;
            console.log('New profile image URL:', profileImageUrl);

            // Create a new image to verify it loads
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                console.log('Profile image loaded successfully');
                setProfileImage(profileImageUrl);
                setPreviewImage(profileImageUrl);
                setImageError(false);
                toast.success('Profile image updated!');
                // Update global user context
                setUser(prev => ({ ...prev, profileImage: data.profileImage }));
            };

            img.onerror = (e) => {
                console.error('Failed to load profile image:', e);
                setImageError(true);
                toast.error('Failed to load profile image');
            };

            img.src = profileImageUrl;

            // Clear the file input
            fileInputRef.current.value = '';
        } catch (err) {
            console.error('Image upload error:', {
                error: err.message,
                stack: err.stack
            });
            toast.error(err.message || 'Failed to upload image');
            setPreviewImage(profileImage);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...form, profileImage })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                const data = await res.json();
                throw new Error(data.message || 'Update failed');
            }

            const data = await res.json();
            if (!data.user) throw new Error('Invalid response data');

            toast.success('Profile updated!');
            setUserState(data.user);
            setForm({ ...form, password: '' });
        } catch (err) {
            console.error('Profile update error:', err);
            toast.error(err.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to delete booking');
            }

            setBookings(bookings.filter(b => b._id !== bookingId));
            toast.success('Booking deleted');
        } catch (error) {
            console.error('Delete booking error:', error);
            toast.error('Failed to delete booking');
        }
    };

    // Update the booking stats display to handle empty state better
    const getBookingStats = () => {
        const now = new Date();
        return {
            total: bookings.length,
            upcoming: bookings.filter(b => new Date(b.checkIn) > now && b.status === 'confirmed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length
        };
    };

    // Add image error handler
    const handleImageError = (e) => {
        console.error('Image load error:', e);
        setImageError(true);
        setPreviewImage('');
        if (e.target.src !== '') {
            toast.error('Failed to load profile image');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600">{t('profile.notFound')}</h2>
                        <p className="mt-2 text-gray-600">{t('profile.pleaseLogin')}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                            {t('auth.login')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="flex flex-col items-center mb-6">
                    {/* Username display */}
                    <div className="text-xl font-semibold text-primary-700 mb-4">{user.name || user.email.split('@')[0]}</div>
                    <div className="text-gray-500 mb-4">{user.email}</div>

                    {/* Avatar with upload */}
                    <div className="relative h-20 w-20 mb-2">
                        {previewImage && !imageError ? (
                            <img
                                src={previewImage}
                                alt={t('profile.profileImage')}
                                className="h-20 w-20 rounded-full object-cover border-2 border-primary-200"
                                onError={handleImageError}
                                crossOrigin="anonymous"
                                loading="eager"
                                referrerPolicy="no-referrer"
                                key={previewImage}
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700">
                                {getInitials(user.name || user.email)}
                            </div>
                        )}
                        <button
                            type="button"
                            className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 shadow hover:bg-primary-700 focus:outline-none"
                            onClick={() => fileInputRef.current.click()}
                            title={t('profile.changeImage')}
                        >
                            <CameraIcon className="h-5 w-5" />
                        </button>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                    {previewImage && previewImage !== profileImage && !imageError && (
                        <div className="flex gap-2 mt-2">
                            <button
                                type="button"
                                className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none"
                                onClick={handleImageUpload}
                            >
                                {t('common.save')}
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                                onClick={() => {
                                    setPreviewImage(profileImage);
                                    fileInputRef.current.value = '';
                                }}
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Booking Stats */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-primary-600 mb-2">{t('profile.bookingStats')}</h3>
                    <div className="flex justify-between text-center gap-2">
                        <div className="flex-1 bg-primary-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-primary-700">{getBookingStats().total}</div>
                            <div className="text-xs text-gray-500">{t('profile.totalBookings')}</div>
                        </div>
                        <div className="flex-1 bg-green-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-green-700">{getBookingStats().upcoming}</div>
                            <div className="text-xs text-gray-500">{t('profile.upcomingBookings')}</div>
                        </div>
                        <div className="flex-1 bg-red-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-red-700">{getBookingStats().cancelled}</div>
                            <div className="text-xs text-gray-500">{t('profile.cancelledBookings')}</div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                {t('auth.name')}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                {t('auth.email')}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {t('profile.newPassword')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-8 text-gray-400 hover:text-gray-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {saving ? (
                                <span className="animate-spin mr-2 h-5 w-5 border-b-2 border-white rounded-full"></span>
                            ) : null}
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile; 