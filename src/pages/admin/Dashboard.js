import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaHome, FaKey, FaMoneyBillWave, FaCalendarCheck } from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProperties: 0,
        activeProperties: 0,
        totalBookings: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredProperties(properties);
        } else {
            const filtered = properties.filter(property =>
                property.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProperties(filtered);
        }
    }, [searchQuery, properties]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsData, propertiesData] = await Promise.all([
                adminService.getStats(),
                adminService.getProperties()
            ]);

            setStats(statsData);
            setProperties(propertiesData);
            setFilteredProperties(propertiesData);
        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            setError('Failed to load dashboard data. Please try again.');
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProperty = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            await adminService.deleteProperty(id);
            setProperties(properties.filter(p => p._id !== id));
            setFilteredProperties(filteredProperties.filter(p => p._id !== id));
            toast.success('Property deleted successfully');
        } catch (err) {
            console.error('Delete property error:', err);
            toast.error('Failed to delete property');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-base text-red-700">{error}</p>
                                <button
                                    onClick={fetchDashboardData}
                                    className="mt-2 text-base font-medium text-red-700 hover:text-red-600"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                    <Link
                        to="/admin/properties/add"
                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FaPlus className={`h-5 w-5 ${i18n.language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                        {t('dashboard.addNewProperty')}
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaHome className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className={`${i18n.language === 'ar' ? 'mr-6' : 'ml-6'} w-0 flex-1`}>
                                    <dl>
                                        <dt className="text-base font-medium text-gray-500 truncate">{t('dashboard.totalProperties')}</dt>
                                        <dd className="text-2xl font-semibold text-gray-900">{stats.totalProperties}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaKey className="h-8 w-8 text-green-600" />
                                </div>
                                <div className={`${i18n.language === 'ar' ? 'mr-6' : 'ml-6'} w-0 flex-1`}>
                                    <dl>
                                        <dt className="text-base font-medium text-gray-500 truncate">{t('dashboard.activeProperties')}</dt>
                                        <dd className="text-2xl font-semibold text-gray-900">{stats.activeProperties}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaCalendarCheck className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className={`${i18n.language === 'ar' ? 'mr-6' : 'ml-6'} w-0 flex-1`}>
                                    <dl>
                                        <dt className="text-base font-medium text-gray-500 truncate">{t('dashboard.totalBookings')}</dt>
                                        <dd className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaMoneyBillWave className="h-8 w-8 text-yellow-600" />
                                </div>
                                <div className={`${i18n.language === 'ar' ? 'mr-6' : 'ml-6'} w-0 flex-1`}>
                                    <dl>
                                        <dt className="text-base font-medium text-gray-500 truncate">{t('dashboard.totalRevenue')}</dt>
                                        <dd className="text-2xl font-semibold text-gray-900">${stats.totalRevenue?.toLocaleString() || '0'}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Properties Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.properties')}</h2>
                            <div className="w-72">
                                <input
                                    type="text"
                                    placeholder={t('dashboard.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className={`px-6 py-4 text-base font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('dashboard.propertyId')}
                                    </th>
                                    <th scope="col" className={`px-6 py-4 text-base font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('dashboard.propertyTitle')}
                                    </th>
                                    <th scope="col" className={`px-6 py-4 text-base font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('dashboard.propertyType')}
                                    </th>
                                    <th scope="col" className={`px-6 py-4 text-base font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('dashboard.propertyPrice')}
                                    </th>
                                    <th scope="col" className={`px-6 py-4 text-base font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('dashboard.propertyStatus')}
                                    </th>
                                    <th scope="col" className={`px-6 py-4 text-base font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('dashboard.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProperties.map((property) => (
                                    <tr key={property._id}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-base text-gray-500 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {property.uniqueId}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {property.title}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-base text-gray-500 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {property.type}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-base text-gray-500 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            ${property.price}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            <span className={`px-3 py-1 inline-flex text-base leading-5 font-semibold rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {property.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-base font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            <div className={`flex ${i18n.language === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                                                <Link
                                                    to={`/admin/properties/${property._id}/edit`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <FaEdit className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteProperty(property._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;