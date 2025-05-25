import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import toast from 'react-hot-toast';
import {
    MagnifyingGlassIcon,
    CheckCircleIcon,
    XCircleIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await bookingService.getAllBookings();
            setBookings(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load bookings');
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await bookingService.updateBookingStatus(bookingId, newStatus);
            setBookings(bookings.map(booking =>
                booking._id === bookingId ? { ...booking, status: newStatus } : booking
            ));
            toast.success(`Booking ${newStatus === 'owner_approved' ? 'approved' : 'confirmed'} successfully`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update booking status');
        }
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        try {
            await bookingService.deleteBooking(bookingId);
            setBookings(bookings.filter(b => b._id !== bookingId));
            toast.success('Booking deleted successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete booking');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'booked_successful':
                return 'bg-green-100 text-green-800';
            case 'owner_approved':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'booked_successful':
                return 'Booked Successfully';
            case 'owner_approved':
                return 'Owner Approved';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="sm:w-48">
                    <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="owner_approved">Owner Approved</option>
                        <option value="booked_successful">Booked Successfully</option>
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Property
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Guest
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dates
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {booking.property.title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.property.location.city}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{booking.user.name}</div>
                                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(booking.checkIn).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(booking.checkOut).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">${booking.totalAmount}</div>
                                        <div className="text-sm text-gray-500">
                                            Deposit: ${booking.depositAmount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(booking._id, 'owner_approved')}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Approve"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(booking._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'owner_approved' && (
                                                <button
                                                    onClick={() => handleStatusChange(booking._id, 'booked_successful')}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Confirm Booking"
                                                >
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No bookings found.</p>
                </div>
            )}
        </div>
    );
};

export default AdminBookings; 