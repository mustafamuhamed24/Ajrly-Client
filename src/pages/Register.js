import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FcGoogle } from 'react-icons/fc';

const Register = () => {
    const { t } = useTranslation();
    const { register } = useAuth();
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = t('auth.nameRequired');
        if (!formData.email) newErrors.email = t('auth.emailRequired');
        if (!formData.phone) newErrors.phone = t('auth.phoneRequired');
        if (!formData.password) newErrors.password = t('auth.passwordRequired');
        if (formData.password && formData.password.length < 6) {
            newErrors.password = t('auth.passwordTooShort');
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.confirmPasswordRequired');
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            await register(formData);
            toast.success(t('auth.registerSuccess'));
            navigate('/');
        } catch (error) {
            toast.error(error.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setSocialLoading(true);
        toast('Google signup not implemented yet', { icon: '⚡' });
        setTimeout(() => setSocialLoading(false), 1200);
        // Here you would redirect to your backend's Google OAuth endpoint
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-primary-600">
                        {t('auth.register')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {t('auth.haveAccount')}{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            {t('auth.signInNow')}
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
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                {t('auth.name')}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                placeholder={t('auth.name')}
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
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
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                {t('auth.phone')}
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                placeholder={t('auth.phone')}
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {t('auth.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
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
                        <div className="relative">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                {t('auth.confirmPassword')}
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                placeholder={t('auth.confirmPassword')}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 top-8 text-gray-400 hover:text-gray-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            {t('auth.register')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register; 