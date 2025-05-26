const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ajrly-backend-production.up.railway.app/api';

export const API_ENDPOINTS = {
    // Auth endpoints
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        register: `${API_BASE_URL}/auth/register`,
        me: `${API_BASE_URL}/auth/me`,
    },

    // Property endpoints
    properties: {
        list: `${API_BASE_URL}/properties`,
        featured: `${API_BASE_URL}/properties/featured`,
        detail: (id) => `${API_BASE_URL}/properties/${id}`,
    },

    // Booking endpoints
    bookings: {
        create: `${API_BASE_URL}/bookings`,
        list: `${API_BASE_URL}/bookings/user`,
        detail: (id) => `${API_BASE_URL}/bookings/${id}`,
        property: (propertyId) => `${API_BASE_URL}/bookings/property/${propertyId}`,
    },

    // Admin endpoints
    admin: {
        stats: `${API_BASE_URL}/admin/statistics`,
        properties: {
            list: `${API_BASE_URL}/admin/properties`,
            create: `${API_BASE_URL}/admin/properties`,
            detail: (id) => `${API_BASE_URL}/admin/properties/${id}`,
            update: (id) => `${API_BASE_URL}/admin/properties/${id}`,
            delete: (id) => `${API_BASE_URL}/admin/properties/${id}`,
        },
        bookings: {
            list: `${API_BASE_URL}/admin/bookings`,
            update: (id) => `${API_BASE_URL}/admin/bookings/${id}`,
        },
        users: {
            list: `${API_BASE_URL}/admin/users`,
            update: (id) => `${API_BASE_URL}/admin/users/${id}`,
            delete: (id) => `${API_BASE_URL}/admin/users/${id}`,
        },
    },
};

export default API_ENDPOINTS; 