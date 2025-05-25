export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',

    // Property endpoints
    PROPERTIES: '/properties',
    PROPERTY_DETAILS: (id) => `/properties/${id}`,
    PROPERTY_SEARCH: '/properties/search',
    PROPERTY_FILTER: '/properties/filter',

    // Booking endpoints
    BOOKINGS: '/bookings',
    BOOKING_DETAILS: (id) => `/bookings/${id}`,
    BOOKING_CANCEL: (id) => `/bookings/${id}/cancel`,
    BOOKING_STATUS: (id) => `/bookings/${id}/status`,

    // Admin endpoints
    ADMIN_STATS: '/admin/statistics',
    ADMIN_PROPERTIES: '/admin/properties',
    ADMIN_BOOKINGS: '/admin/bookings',
    ADMIN_USERS: '/admin/users',

    // User endpoints
    USER_PROFILE: '/users/profile',
    USER_BOOKINGS: '/users/bookings',
    USER_FAVORITES: '/users/favorites',

    // Notification endpoints
    NOTIFICATIONS: '/notifications',
    NOTIFICATION_READ: (id) => `/notifications/${id}/read`,

    // Payment endpoints
    PAYMENT_INITIATE: '/payments/initiate',
    PAYMENT_VERIFY: '/payments/verify',
    PAYMENT_WEBHOOK: '/payments/webhook'
};

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const PAYMENT_METHODS = {
    VODAFONE_CASH: 'vodafone_cash',
    MIZZA: 'mizza'
};

export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

export const PROPERTY_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending'
};

export const PROPERTY_TYPES = {
    APARTMENT: 'apartment',
    HOUSE: 'house',
    VILLA: 'villa',
    CONDO: 'condo'
}; 