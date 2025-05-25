import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { LoadingProvider } from './context/LoadingContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/Properties';
import AdminBookings from './pages/admin/Bookings';
import AdminUsers from './pages/admin/Users';
import AddProperty from './pages/admin/AddProperty';
import EditProperty from './pages/admin/EditProperty';
import { Toaster } from 'react-hot-toast';
import ChatWidget from './components/ChatWidget';
import Profile from './pages/Profile';
import { ChatProvider } from './context/ChatContext';
import ForgotPassword from './pages/ForgotPassword';

// Protected Route component as a separate component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

// App Routes component to handle routing logic
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/properties/:id" element={<PropertyDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute>
            <AdminProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute>
            <AdminBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/add"
        element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/:id/edit"
        element={
          <ProtectedRoute>
            <EditProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <LoadingProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontFamily: 'Inter, sans-serif' } }} />
        <AuthProvider>
          <ChatProvider>
            <Router>
              <Layout>
                <AppRoutes />
              </Layout>
            </Router>
          </ChatProvider>
        </AuthProvider>
      </LoadingProvider>
    </I18nextProvider>
  );
};

export default App;
