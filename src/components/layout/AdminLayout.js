import React from 'react';
import AdminNav from './AdminNav';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-3">
                        <AdminNav />
                    </div>

                    {/* Main content */}
                    <main className="mt-8 lg:mt-0 lg:col-span-9">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout; 