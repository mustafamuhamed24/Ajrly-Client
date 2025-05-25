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
            setUser(response.data);
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
            const { token: newToken, ...userData } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
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
            const { token: newToken, ...user } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(user);
            setError(null);
            return user;
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
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 