import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { LoadingProvider } from './context/LoadingContext';
import { NotificationProvider } from './context/NotificationContext';
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
import AddProperty from './pages/admin/AddProperty';
import EditProperty from './pages/admin/EditProperty';
import { Toaster } from 'react-hot-toast';
import Profile from './pages/Profile';
import { ChatProvider } from './context/ChatContext';
import ForgotPassword from './pages/ForgotPassword';
import Chat from './pages/Chat';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import NotFound from './pages/NotFound';

// Protected Route component as a separate component
const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { isAuthenticated, isOwner, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireOwner && !isOwner) {
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

      {/* Footer Pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/faq" element={<FAQ />} />

      {/* Protected Routes */}
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* Owner Routes */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute requireOwner>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/properties"
        element={
          <ProtectedRoute requireOwner>
            <AdminProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/bookings"
        element={
          <ProtectedRoute requireOwner>
            <AdminBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/properties/add"
        element={
          <ProtectedRoute requireOwner>
            <AddProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/properties/:id/edit"
        element={
          <ProtectedRoute requireOwner>
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

      {/* 404 - Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <LoadingProvider>
        <Toaster position="top-right" toastOptions={{ duration: 2000, style: { fontFamily: 'Inter, sans-serif' } }} />
        <AuthProvider>
          <NotificationProvider>
            <ChatProvider>
              <Router basename="/Ajrly-Client">
                <Layout>
                  <AppRoutes />
                </Layout>
              </Router>
            </ChatProvider>
          </NotificationProvider>
        </AuthProvider>
      </LoadingProvider>
    </I18nextProvider>
  );
};

export default App;
