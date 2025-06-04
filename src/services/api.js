import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
    changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
    resetPassword: (email) => api.post('/auth/reset-password', { email })
};

export const propertyService = {
    getProperties: () => api.get('/properties'),
    getPropertyById: (id) => api.get(`/properties/${id}`),
    getFeaturedProperties: () => api.get('/properties/featured'),
    searchProperties: (params) => api.get('/properties', { params })
};

export const bookingService = {
    createBooking: (bookingData) => api.post('/bookings', bookingData),
    getUserBookings: () => api.get('/bookings/list'),
    getOwnerBookings: () => api.get('/bookings/owner'),
    getBookingById: (id) => api.get(`/bookings/${id}`),
    getPropertyBookings: (propertyId) => api.get(`/properties/${propertyId}/bookings`),
    cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
    updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
    processPayment: (bookingId, paymentData) => api.post(`/bookings/${bookingId}/payment`, paymentData),
    deleteBooking: (id) => api.delete(`/bookings/${id}`)
};

export const adminService = {
    getStatistics: () => api.get('/admin/stats'),
    getProperties: () => api.get('/admin/properties'),
    createProperty: (formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        return api.post('/admin/properties', formData, config);
    },
    updateProperty: (id, formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        return api.put(`/admin/properties/${id}`, formData, config);
    },
    deleteProperty: (id) => api.delete(`/admin/properties/${id}`),
    getBookings: () => api.get('/admin/bookings'),
    updateBookingStatus: (id, status) => api.put(`/admin/bookings/${id}/status`, { status }),
    getUsers: () => api.get('/admin/users'),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

export default api; 