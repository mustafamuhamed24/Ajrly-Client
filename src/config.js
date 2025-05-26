// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ajrly-backend-production.up.railway.app/api';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        VERIFY_EMAIL: '/auth/verify-email',
        RESET_PASSWORD: '/auth/reset-password',
        FORGOT_PASSWORD: '/auth/forgot-password',
    },
    // User endpoints
    USER: {
        PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
        CHANGE_PASSWORD: '/users/change-password',
        UPLOAD_AVATAR: '/users/avatar',
    },
    // Property endpoints
    PROPERTY: {
        LIST: '/properties',
        CREATE: '/properties',
        DETAILS: (id) => `/properties/${id}`,
        UPDATE: (id) => `/properties/${id}`,
        DELETE: (id) => `/properties/${id}`,
        SEARCH: '/properties/search',
        FILTER: '/properties/filter',
        FEATURED: '/properties/featured',
        SIMILAR: (id) => `/properties/${id}/similar`,
    },
    // Admin endpoints
    ADMIN: {
        USERS: '/admin/users',
        PROPERTIES: '/admin/properties',
        BOOKINGS: '/admin/bookings',
        REVIEWS: '/admin/reviews',
        DASHBOARD: '/admin/dashboard',
    },
    // Booking endpoints
    BOOKING: {
        CREATE: '/bookings',
        LIST: '/bookings',
        DETAILS: (id) => `/bookings/${id}`,
        UPDATE: (id) => `/bookings/${id}`,
        CANCEL: (id) => `/bookings/${id}/cancel`,
    },
    // Review endpoints
    REVIEW: {
        CREATE: '/reviews',
        LIST: '/reviews',
        UPDATE: (id) => `/reviews/${id}`,
        DELETE: (id) => `/reviews/${id}`,
    },
    // Payment endpoints
    PAYMENT: {
        CREATE_INTENT: '/payments/create-intent',
        CONFIRM: '/payments/confirm',
        REFUND: '/payments/refund',
    },
    // Notification endpoints
    NOTIFICATION: {
        LIST: '/notifications',
        MARK_READ: (id) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
    },
    // Chat endpoints
    CHAT: {
        LIST: '/chats',
        CREATE: '/chats/create',
        MESSAGES: (chatId) => `/chats/${chatId}/messages`,
        MARK_READ: (chatId) => `/chats/${chatId}/read`,
    },
};

// Property Status Constants
export const PROPERTY_STATUS = {
    AVAILABLE: 'available',
    RENTED: 'rented',
    MAINTENANCE: 'maintenance',
    SOLD: 'sold',
    PENDING: 'pending'
}; 