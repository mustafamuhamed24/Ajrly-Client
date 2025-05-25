import api from './api';

// export { adminService } from './api';

export const adminService = {
    // Get dashboard statistics
    getStats: async () => {
        try {
            const response = await api.get('/admin/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching admin stats:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
        }
    },

    // Get all properties
    getProperties: async () => {
        try {
            const response = await api.get('/admin/properties');
            return response.data;
        } catch (error) {
            console.error('Error fetching properties:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch properties');
        }
    },

    // Get property by ID
    getPropertyById: async (id) => {
        try {
            const response = await api.get(`/admin/properties/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching property:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch property details');
        }
    },

    // Create new property
    createProperty: async (formData) => {
        try {
            const response = await api.post('/admin/properties', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating property:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create property');
        }
    },

    // Update property
    updateProperty: async (id, formData) => {
        try {
            const response = await api.put(`/admin/properties/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating property:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to update property');
        }
    },

    // Delete property
    deleteProperty: async (id) => {
        try {
            const response = await api.delete(`/admin/properties/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting property:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to delete property');
        }
    },

    // Get all bookings
    getBookings: async () => {
        try {
            const response = await api.get('/admin/bookings');
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
        }
    },

    // Update booking status
    updateBookingStatus: async (id, status) => {
        try {
            const response = await api.put(`/admin/bookings/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating booking status:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to update booking status');
        }
    }
};

