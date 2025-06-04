import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    useEffect(() => {
        checkUser();
    }, [token]);

    const checkUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/auth/me`);
            const userData = response.data.user || response.data;
            userData._id = userData._id || userData.id;
            setUser(userData);
            setError(null);
        } catch (err) {
            console.error('Auth check failed:', err);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password
            });
            const { token: newToken, ...rest } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            const userData = rest.user || rest;
            userData._id = userData._id || userData.id;
            setUser(userData);
            setError(null);
            return userData;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
            const { token: newToken, ...rest } = response.data;
            localStorage.setItem('token', newToken);
            const userObj = rest.user || rest;
            userObj._id = userObj._id || userObj.id;
            setUser(userObj);
            setError(null);
            return userObj;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError(null);
        delete axios.defaults.headers.common['Authorization'];
        // Clear any other auth-related state
        sessionStorage.clear();
        // Clear any auth-related cookies
        document.cookie.split(";").forEach(function (c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    };

    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isOwner: user?.role === 'owner'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 