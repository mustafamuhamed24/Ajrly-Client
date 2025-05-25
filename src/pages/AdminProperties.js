import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/api';
import toast from 'react-hot-toast';
import {
    PencilIcon,
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await propertyService.getAllProperties();
            setProperties(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load properties');
            toast.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (propertyId) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;

        try {
            await propertyService.deleteProperty(propertyId);
            setProperties(properties.filter(p => p._id !== propertyId));
            toast.success('Property deleted successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete property');
        }
    };

    const filteredProperties = properties.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your property listings and their details.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link
                        to="/admin/properties/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Property
                    </Link>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Properties Table */}
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Property
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProperties.map((property) => (
                                <tr key={property._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                    src={property.images[0] || '/placeholder.jpg'}
                                                    alt={property.title}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {property.title}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {property.type}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{property.location.city}</div>
                                        <div className="text-sm text-gray-500">{property.location.address}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">${property.price}</div>
                                        <div className="text-sm text-gray-500">per night</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${property.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {property.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <Link
                                                to={`/admin/properties/${property._id}/edit`}
                                                className="text-primary-600 hover:text-primary-900"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(property._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredProperties.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No properties found.</p>
                </div>
            )}
        </div>
    );
};

export default AdminProperties; 