import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await adminService.getBookings();
            setBookings(data);
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId, status) => {
        try {
            await adminService.updateBookingStatus(bookingId, status);
            setBookings(bookings.map(booking =>
                booking._id === bookingId ? { ...booking, status } : booking
            ));
        } catch (err) {
            setError('Failed to update booking status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-600">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Bookings</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                        <li key={booking._id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-primary-600 truncate">
                                                {booking.property.title}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                        booking.status
                                                    )}`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Guest: {booking.user.name}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    Email: {booking.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                                        </p>
                                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                            Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <p>Total: ${booking.totalPrice}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end space-x-2">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <button
                                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Bookings; 