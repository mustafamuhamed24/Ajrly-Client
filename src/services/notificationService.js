import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all notifications
export const getNotifications = async () => {
    try {
        const response = await axios.get(`${API_URL}/notifications`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Get unread notification count
export const getUnreadCount = async () => {
    try {
        const response = await axios.get(`${API_URL}/notifications/unread/count`, {
            withCredentials: true
        });
        return response.data.count;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
    }
};

// Mark a notification as read
export const markAsRead = async (notificationId) => {
    try {
        const response = await axios.put(
            `${API_URL}/notifications/${notificationId}/read`,
            {},
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    try {
        const response = await axios.put(
            `${API_URL}/notifications/read/all`,
            {},
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/notifications/${notificationId}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

// Clear all notifications
export const clearAllNotifications = async () => {
    try {
        const response = await axios.delete(`${API_URL}/notifications`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error clearing notifications:', error);
        throw error;
    }
}; 