import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setLoading } = useLoading();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            toast.success(t('auth.loginSuccess'));
            navigate('/');
        } catch (error) {
            toast.error(error.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setSocialLoading(true);
        toast('Google login not implemented yet', { icon: '⚡' });
        setTimeout(() => setSocialLoading(false), 1200);
        // Here you would redirect to your backend's Google OAuth endpoint
    };

    const validate = () => {
        const errs = {};
        if (!formData.email) errs.email = 'Email is required';
        if (!formData.password) errs.password = 'Password is required';
        return errs;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-primary-600">
                        {t('auth.login')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t('auth.noAccount')}{' '}
                        <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                            {t('auth.signUpNow')}
                        </Link>
                    </p>
                </div>
                {/* Social login */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={socialLoading}
                        className="w-full flex items-center justify-center border border-gray-300 bg-white rounded-md py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {socialLoading ? (
                            <span className="animate-spin mr-2 h-5 w-5 border-b-2 border-gray-400 rounded-full"></span>
                        ) : (
                            <FcGoogle className="h-5 w-5 mr-2" />
                        )}
                        {t('auth.continueWithGoogle')}
                    </button>
                </div>
                {/* Divider */}
                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-200" />
                    <span className="mx-2 text-gray-400 text-xs">{t('common.or')}</span>
                    <div className="flex-grow border-t border-gray-200" />
                </div>
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                {t('auth.email')}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                placeholder={t('auth.email')}
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {t('auth.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                placeholder={t('auth.password')}
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-8 text-gray-400 hover:text-gray-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <label htmlFor="rememberMe" className="mr-2 block text-sm text-gray-900">
                                {t('auth.rememberMe')}
                            </label>
                        </div>
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            {t('auth.login')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login; 