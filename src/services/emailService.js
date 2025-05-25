import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const emailService = {
    sendBookingConfirmation: (bookingId) =>
        api.post(`${API_ENDPOINTS.bookings.detail(bookingId)}/send-confirmation`),

    sendOwnerNotification: (bookingId) =>
        api.post(`${API_ENDPOINTS.bookings.detail(bookingId)}/notify-owner`),

    sendPaymentConfirmation: (bookingId) =>
        api.post(`${API_ENDPOINTS.bookings.detail(bookingId)}/send-payment-confirmation`),
};

export default emailService; 