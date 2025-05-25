import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { propertyService, bookingService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProperties: 0,
        activeProperties: 0,
        totalBookings: 0,
        totalRevenue: 0,
        totalUsers: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsData, bookingsData] = await Promise.all([
                    propertyService.getStats(),
                    bookingService.getRecentBookings()
                ]);
                setStats(statsData);
                setRecentBookings(bookingsData);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-lg shadow">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user.name}!
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {user.role === 'admin'
                            ? 'Manage the platform and monitor all activities'
                            : user.role === 'owner'
                                ? 'Manage your properties and bookings'
                                : 'View your bookings and explore properties'}
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {user.role === 'admin' ? (
                        <>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                                <p className="mt-2 text-3xl font-bold text-primary-600">
                                    {stats.totalUsers}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900">Total Properties</h3>
                                <p className="mt-2 text-3xl font-bold text-green-600">
                                    {stats.totalProperties}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
                                <p className="mt-2 text-3xl font-bold text-blue-600">
                                    {stats.totalBookings}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
                                <p className="mt-2 text-3xl font-bold text-green-600">
                                    ${stats.totalRevenue}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {user.role === 'owner' ? 'Total Properties' : 'Total Bookings'}
                                </h3>
                                <p className="mt-2 text-3xl font-bold text-primary-600">
                                    {user.role === 'owner' ? stats.totalProperties : stats.totalBookings}
                                </p>
                            </div>
                            {user.role === 'owner' && (
                                <>
                                    <div className="bg-white p-6 rounded-lg shadow">
                                        <h3 className="text-lg font-medium text-gray-900">Active Properties</h3>
                                        <p className="mt-2 text-3xl font-bold text-green-600">
                                            {stats.activeProperties}
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-lg shadow">
                                        <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
                                        <p className="mt-2 text-3xl font-bold text-green-600">
                                            ${stats.totalRevenue}
                                        </p>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Recent Bookings Section */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {user.role === 'owner' ? 'Recent Booking Requests' : 'Your Recent Bookings'}
                        </h2>
                    </div>
                    <div className="p-6">
                        {recentBookings.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                {user.role === 'owner'
                                    ? 'No booking requests yet'
                                    : 'No bookings found'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Property
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Guest
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dates
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentBookings.map((booking) => (
                                            <tr key={booking._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.property.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {user.role === 'owner'
                                                            ? booking.user.name
                                                            : 'You'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : booking.status === 'booked_successful'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {booking.status === 'pending'
                                                            ? 'Pending'
                                                            : booking.status === 'booked_successful'
                                                                ? 'Confirmed'
                                                                : 'Cancelled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {user.role === 'owner' && booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleApproveBooking(booking._id)}
                                                            className="text-primary-600 hover:text-primary-900 mr-4"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    <Link
                                                        to={`/bookings/${booking._id}`}
                                                        className="text-primary-600 hover:text-primary-900"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.role === 'admin' ? (
                        <>
                            <Link
                                to="/admin/users"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
                                <p className="mt-2 text-gray-600">
                                    View and manage all platform users
                                </p>
                            </Link>
                            <Link
                                to="/admin/properties"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-medium text-gray-900">Manage Properties</h3>
                                <p className="mt-2 text-gray-600">
                                    View and manage all listed properties
                                </p>
                            </Link>
                            <Link
                                to="/admin/bookings"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-medium text-gray-900">Manage Bookings</h3>
                                <p className="mt-2 text-gray-600">
                                    View and manage all bookings
                                </p>
                            </Link>
                            <Link
                                to="/admin/reports"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-medium text-gray-900">View Reports</h3>
                                <p className="mt-2 text-gray-600">
                                    Access platform analytics and reports
                                </p>
                            </Link>
                        </>
                    ) : user.role === 'owner' ? (
                        <>
                            <Link
                                to="/properties/new"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-medium text-gray-900">Add New Property</h3>
                                <p className="mt-2 text-gray-600">
                                    List your property and start receiving booking requests
                                </p>
                            </Link>
                            <Link
                                to="/properties"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-medium text-gray-900">Manage Properties</h3>
                                <p className="mt-2 text-gray-600">
                                    View and manage your listed properties
                                </p>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/properties"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-medium text-gray-900">Browse Properties</h3>
                                <p className="mt-2 text-gray-600">
                                    Find your perfect rental property
                                </p>
                            </Link>
                            <Link
                                to="/bookings"
                                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-medium text-gray-900">View All Bookings</h3>
                                <p className="mt-2 text-gray-600">
                                    Manage your booking history
                                </p>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 