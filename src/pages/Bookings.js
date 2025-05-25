import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import toast from 'react-hot-toast';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await bookingService.getUserBookings();
            if (response.data) {
                setBookings(response.data);
            } else {
                setBookings([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load bookings. Please try again later.');
            setBookings([]);
            toast.error(err.response?.data?.message || 'Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    const deleteBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        try {
            await bookingService.deleteBooking(bookingId);
            setBookings(bookings.filter(booking => booking._id !== bookingId));
            toast.success('Booking deleted.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete booking. Please try again.');
            toast.error(err.response?.data?.message || 'Failed to delete booking.');
        }
    };

    const confirmBooking = async (bookingId) => {
        try {
            await bookingService.updateBookingStatus(bookingId, 'booked_successful');
            setBookings(bookings.map(booking =>
                booking._id === bookingId ? { ...booking, status: 'booked_successful' } : booking
            ));
            toast.success('Booking confirmed successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to confirm booking. Please try again.');
            toast.error(err.response?.data?.message || 'Failed to confirm booking.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'owner_approved':
                return 'bg-blue-100 text-blue-800';
            case 'booked_successful':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending Owner Approval';
            case 'owner_approved':
                return 'Owner Approved - Confirm Booking';
            case 'booked_successful':
                return 'Booked Successfully';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[40vh] text-lg font-semibold text-primary-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No bookings found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white shadow-lg rounded-2xl overflow-hidden">
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1">
                                        <div className="text-2xl font-bold text-primary-900 hover:text-primary-600 transition-colors">
                                            {booking.property ? booking.property.title : <span className="text-red-500">Property not found</span>}
                                        </div>
                                        <p className="text-primary-700 mt-1 text-base">
                                            {booking.property ? `${booking.property.location.address}, ${booking.property.location.city}` : ''}
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0 md:ml-6">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
                                        >
                                            {getStatusText(booking.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-primary-500">Check-in</p>
                                        <p className="text-lg font-semibold text-primary-800">
                                            {new Date(booking.checkIn).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-primary-500">Check-out</p>
                                        <p className="text-lg font-semibold text-primary-800">
                                            {new Date(booking.checkOut).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-sm text-primary-500">Total Amount</p>
                                        <p className="text-2xl font-bold text-primary-800">
                                            ${booking.totalAmount}
                                        </p>
                                        <p className="text-sm text-primary-500 mt-1">
                                            Deposit: ${booking.depositAmount}
                                        </p>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-4 md:mt-0">
                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={e => { e.stopPropagation(); deleteBooking(booking._id); }}
                                                className="text-red-600 hover:text-red-800 font-semibold"
                                            >
                                                Delete Booking
                                            </button>
                                        )}
                                        {booking.status === 'owner_approved' && (
                                            <button
                                                onClick={e => { e.stopPropagation(); confirmBooking(booking._id); }}
                                                className="text-green-600 hover:text-green-800 font-semibold"
                                            >
                                                Confirm Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookings; 