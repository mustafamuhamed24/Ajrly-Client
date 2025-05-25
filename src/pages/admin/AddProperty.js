import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'react-i18next';

const propertyTypes = [
    'apartment',
    'villa',
    'house',
    'condo',
    'studio',
    'duplex',
];
const amenitiesList = [
    'wifi',
    'parking',
    'pool',
    'gym',
    'airConditioning',
    'balcony',
    'elevator',
    'petFriendly',
    'furnished',
];

const AddProperty = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        status: 'active',
        location: {
            address: '',
            city: '',
            state: '',
            country: ''
        },
        amenities: [],
        images: []
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('location.')) {
            const locField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [locField]: value
                }
            }));
        } else if (name === 'amenities') {
            if (checked) {
                setFormData(prev => ({ ...prev, amenities: [...prev.amenities, value] }));
            } else {
                setFormData(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== value) }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setError(t('addProperty.maxImages'));
            return;
        }
        setFormData(prev => ({ ...prev, images: files }));
        setPreviewUrls(files.map(file => URL.createObjectURL(file)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setProgress(0);
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'location') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else if (key === 'images') {
                    for (let i = 0; i < formData.images.length; i++) {
                        submitData.append('images', formData.images[i]);
                    }
                } else if (key === 'amenities') {
                    submitData.append('amenities', JSON.stringify(formData.amenities));
                } else {
                    submitData.append(key, formData[key]);
                }
            });
            const response = await adminService.createProperty(submitData, (event) => {
                if (event.lengthComputable) {
                    setProgress(Math.round((event.loaded * 100) / event.total));
                }
            });
            if (response.data.success) {
                navigate('/admin');
            } else {
                setError(response.data.message || t('addProperty.failed'));
            }
        } catch (err) {
            setError(err.response?.data?.message || t('addProperty.failed'));
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 px-2 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl bg-white p-4 sm:p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-6 text-center">Add New Property</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                        {/* Price */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                        {/* Type */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                <option value="">Select type</option>
                                {propertyTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        {/* Area */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Area (m²)</label>
                            <input type="number" name="area" value={formData.area} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                        {/* Bedrooms */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                        {/* Bathrooms */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                        {/* Status */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        {/* Amenities */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700">Amenities</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {amenitiesList.map(amenity => (
                                    <label key={amenity} className="flex items-center text-xs sm:text-sm">
                                        <input
                                            type="checkbox"
                                            name="amenities"
                                            value={amenity}
                                            checked={formData.amenities.includes(amenity)}
                                            onChange={handleChange}
                                            className="mr-1"
                                        />
                                        {amenity}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    {/* Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input type="text" name="location.address" value={formData.location.address} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" name="location.city" value={formData.location.city} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" name="location.state" value={formData.location.state} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Country</label>
                            <input type="text" name="location.country" value={formData.location.country} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        </div>
                    </div>
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Images</label>
                        <input type="file" name="images" multiple accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                        {/* Image previews */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {previewUrls.map((url, idx) => (
                                <img key={idx} src={url} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                            ))}
                        </div>
                    </div>
                    {/* Submit Button */}
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                            {loading ? 'Adding...' : 'Add Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProperty; 