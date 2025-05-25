import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService, propertyService } from '../services/api';
import toast from 'react-hot-toast';
import {
    ChartBarIcon,
    HomeIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProperties: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeBookings: 0,
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch properties
            const propertiesResponse = await propertyService.getAllProperties();
            const properties = propertiesResponse.data;

            // Fetch bookings
            const bookingsResponse = await bookingService.getAllBookings();
            const bookings = bookingsResponse.data;

            // Calculate stats
            const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
            const activeBookings = bookings.filter(booking =>
                new Date(booking.checkIn) <= new Date() &&
                new Date(booking.checkOut) >= new Date()
            ).length;

            setStats({
                totalProperties: properties.length,
                totalBookings: bookings.length,
                totalRevenue,
                activeBookings,
            });

            // Get recent bookings (last 5)
            setRecentBookings(bookings.slice(0, 5));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data');
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
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
                    title="Active Bookings"
                    value={stats.activeBookings}
                    icon={UserGroupIcon}
                    color="text-purple-600"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={CurrencyDollarIcon}
                    color="text-yellow-600"
                />
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                        <div key={booking._id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {booking.property.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                    </p>
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
        </div>
    );
};

export default AdminDashboard; 