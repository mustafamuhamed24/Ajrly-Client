import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import {
    ChartBarIcon,
    HomeIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ExclamationCircleIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProperties: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0,
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [socket, setSocket] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        // Socket event listeners
        newSocket.on('booking:created', handleNewBooking);
        newSocket.on('booking:updated', handleBookingUpdate);
        newSocket.on('booking:cancelled', handleBookingCancellation);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleNewBooking = (data) => {
        fetchDashboardData();
        toast.success('New booking received!');
    };

    const handleBookingUpdate = (data) => {
        fetchDashboardData();
        toast.success('Booking updated!');
    };

    const handleBookingCancellation = (data) => {
        fetchDashboardData();
        toast.success('Booking cancelled!');
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch statistics
            const statsResponse = await adminService.getStatistics();
            setStats(statsResponse.data);

            // Fetch recent bookings
            const bookingsResponse = await adminService.getBookings();
            const bookings = bookingsResponse.data;

            // Get recent bookings (last 5)
            const sortedBookings = [...bookings].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setRecentBookings(sortedBookings.slice(0, 5));
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBookingAction = async (bookingId, action) => {
        try {
            await adminService.updateBookingStatus(bookingId, action);
            toast.success(`Booking ${action} successfully`);
            setShowBookingModal(false);
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update booking status');
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
        <div
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    const BookingModal = ({ booking, onClose, onAction }) => {
        if (!booking) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Property</h3>
                                <p className="text-gray-600">{booking.propertyDetails.title}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Guest Information</h3>
                                <div className="mt-2 space-y-1">
                                    <p className="text-gray-600">Name: {booking.guestDetails.name}</p>
                                    <p className="text-gray-600">Email: {booking.guestDetails.email}</p>
                                    <p className="text-gray-600">Phone: {booking.guestDetails.phone}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
                                <div className="mt-2 space-y-1">
                                    <p className="text-gray-600">
                                        Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">
                                        Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">
                                        Total Amount: ${booking.totalAmount}
                                    </p>
                                    <p className="text-gray-600">
                                        Status: <span className={`font-medium ${booking.status === 'confirmed' ? 'text-green-600' :
                                                booking.status === 'cancelled' ? 'text-red-600' :
                                                    'text-yellow-600'
                                            }`}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {booking.status === 'pending' && (
                                <div className="flex space-x-4 mt-6">
                                    <button
                                        onClick={() => onAction(booking._id, 'confirmed')}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        Confirm Booking
                                    </button>
                                    <button
                                        onClick={() => onAction(booking._id, 'cancelled')}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                                    >
                                        <XCircleIcon className="h-5 w-5 mr-2" />
                                        Cancel Booking
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading dashboard</h3>
                    <p className="mt-1 text-sm text-gray-500">{error}</p>
                    <div className="mt-6">
                        <button
                            onClick={fetchDashboardData}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
                <p className="mt-2 text-sm text-gray-600">Here's what's happening with your properties today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Properties"
                    value={stats.totalProperties}
                    icon={HomeIcon}
                    color="text-blue-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    icon={CalendarIcon}
                    color="text-green-600"
                />
                <StatCard
                    title="Pending Bookings"
                    value={stats.pendingBookings}
                    icon={UserGroupIcon}
                    color="text-yellow-600"
                    onClick={() => {
                        const pendingBookings = recentBookings.filter(b => b.status === 'pending');
                        if (pendingBookings.length > 0) {
                            setSelectedBooking(pendingBookings[0]);
                            setShowBookingModal(true);
                        } else {
                            toast.info('No pending bookings to review');
                        }
                    }}
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={CurrencyDollarIcon}
                    color="text-purple-600"
                />
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => {
                                setSelectedBooking(booking);
                                setShowBookingModal(true);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {booking.propertyDetails.title}
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-500">
                                            Guest: {booking.guestDetails.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        ${booking.totalAmount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="px-6 py-4 bg-gray-50">
                    <Link
                        to="/admin/bookings"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        View all bookings →
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/admin/properties/new"
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                    <h3 className="text-lg font-medium text-gray-900">Add New Property</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Create a new property listing with details and images.
                    </p>
                </Link>
                <Link
                    to="/admin/properties"
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                    <h3 className="text-lg font-medium text-gray-900">Manage Properties</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        View and edit existing property listings.
                    </p>
                </Link>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    booking={selectedBooking}
                    onClose={() => setShowBookingModal(false)}
                    onAction={handleBookingAction}
                />
            )}
        </div>
    );
};

export default AdminDashboard; 