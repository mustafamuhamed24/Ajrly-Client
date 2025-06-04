import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const initialForm = {
    title: '',
    description: '',
    price: '',
    area: '',
    type: '',
    location: {
        address: '',
        city: '',
        state: '',
        country: ''
    },
    bedrooms: '',
    bathrooms: '',
    featured: false,
    amenities: [],
};

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

const propertyTypes = [
    'apartment',
    'villa',
    'house',
    'condo',
    'studio',
    'duplex',
];

const Properties = () => {
    const { t, i18n } = useTranslation();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const data = await adminService.getProperties();
            setProperties(data);
        } catch (err) {
            setError('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const filteredProperties = properties.filter(
        (property) =>
            property.uniqueId?.toLowerCase().includes(search.toLowerCase()) ||
            property.title?.toLowerCase().includes(search.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('location.')) {
            const locField = name.split('.')[1];
            setForm((prev) => ({
                ...prev,
                location: {
                    ...prev.location,
                    [locField]: value,
                },
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        // Validate file types
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            setError('Only JPG, PNG, and WebP images are allowed');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            setError('Images must be less than 5MB');
            return;
        }

        setSelectedImages(files);
        setError(''); // Clear any previous errors

        // Create preview URLs for new files
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));

        if (editId) {
            // If editing, combine existing previews with new ones
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        } else {
            // If creating new, just use new previews
            setPreviewUrls(newPreviewUrls);
        }
    };

    const handleEdit = (property) => {
        navigate(`/owner/properties/${property._id}/edit`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;
        try {
            await adminService.deleteProperty(id);
            setProperties(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            setError('Failed to delete property');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        setError('');

        try {
            const formData = new FormData(e.target);
            formData.delete('uniqueId'); // Ensure uniqueId is never sent

            if (editId) {
                // Update existing property
                const response = await adminService.updateProperty(editId, formData);
                setProperties(prev => prev.map(p => p._id === editId ? response.data : p));
            } else {
                // Create new property
                const response = await adminService.createProperty(formData);
                setProperties(prev => [...prev, response.data]);
            }

            setShowForm(false);
            setForm(initialForm);
            setEditId(null);
            setSelectedImages([]);
            setPreviewUrls([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save property');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdd = () => {
        setForm(initialForm);
        setEditId(null);
        setSelectedImages([]);
        setPreviewUrls([]);
        setShowForm(true);
    };

    const removeImage = (index) => {
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        if (index < selectedImages.length) {
            setSelectedImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Helper: get columns based on language direction
    const getTableColumns = () => {
        const columns = [
            { key: 'uniqueId', label: t('addProperty.uniqueId'), width: 'w-32', render: p => p.uniqueId },
            { key: 'title', label: t('addProperty.title'), width: 'w-48', render: p => p.title },
            {
                key: 'type', label: t('addProperty.type'), width: 'w-32', render: p => {
                    const typeKey = (p.type || '').toLowerCase().replace(/\s/g, '');
                    const translated = t(`addProperty.types.${typeKey}`);
                    return translated === `addProperty.types.${typeKey}` ? p.type : translated;
                }
            },
            { key: 'price', label: t('addProperty.price'), width: 'w-24', render: p => `$${p.price}` },
            {
                key: 'status', label: t('addProperty.status'), width: 'w-24', render: p => {
                    const statusKey = (p.status || '').toLowerCase().replace(/\s/g, '');
                    const translated = t(`addProperty.statuses.${statusKey}`);
                    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusKey === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{translated === `addProperty.statuses.${statusKey}` ? p.status : translated}</span>;
                }
            },
            { key: 'bedrooms', label: t('addProperty.bedrooms'), width: 'w-20', render: p => p.bedrooms },
            { key: 'bathrooms', label: t('addProperty.bathrooms'), width: 'w-20', render: p => p.bathrooms },
            { key: 'area', label: t('addProperty.area'), width: 'w-20', render: p => p.area },
            {
                key: 'city', label: t('addProperty.city'), width: 'w-32', render: p => (
                    <>
                        <div className="text-sm text-gray-900">{p.location.city}</div>
                        <div className="text-sm text-gray-500">{p.location.address}</div>
                    </>
                )
            },
            {
                key: 'amenities', label: t('addProperty.amenities'), width: 'w-40', render: p => (
                    <div className="text-xs text-gray-500 mt-1">
                        {p.amenities && (() => {
                            let amenitiesArray;
                            if (typeof p.amenities === 'string') {
                                try { amenitiesArray = JSON.parse(p.amenities); } catch (e) { amenitiesArray = []; }
                            } else { amenitiesArray = p.amenities; }
                            return amenitiesArray.length > 0 ? (
                                <span>
                                    {amenitiesArray.map((amenity, idx) => {
                                        const amenityKey = (amenity || '').toLowerCase().replace(/\s/g, '');
                                        const translated = t(`addProperty.amenitiesList.${amenityKey}`);
                                        return <span key={idx}>{translated === `addProperty.amenitiesList.${amenityKey}` ? amenity : translated}{idx < amenitiesArray.length - 1 ? (i18n.language === 'ar' ? '، ' : ', ') : ''}</span>;
                                    })}
                                </span>
                            ) : null;
                        })()}
                    </div>
                )
            },
            {
                key: 'actions', label: t('addProperty.actions'), width: 'w-32', render: p => (
                    <div className={`flex ${i18n.language === 'ar' ? 'justify-start' : 'justify-end'} gap-2`}>
                        <button
                            onClick={e => { e.stopPropagation(); handleEdit(p); }}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >{t('addProperty.edit')}</button>
                        <button
                            onClick={e => { e.stopPropagation(); handleDelete(p._id); }}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >{t('addProperty.delete')}</button>
                    </div>
                )
            },
            {
                key: 'image', label: t('addProperty.image'), width: 'w-24', render: p => (
                    p.images && p.images.length > 0 ? (
                        <img src={p.images[0].url} alt={p.title} className="w-16 h-16 object-cover rounded" />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400">{t('addProperty.noImage')}</span>
                        </div>
                    )
                )
            },
        ];
        // For RTL, reverse the columns and put actions on the right
        if (i18n.language === 'ar') {
            // Place image first, then reverse the rest
            return [columns[columns.length - 1], ...columns.slice(0, columns.length - 1).reverse()];
        }
        // For LTR, image first, then rest
        return [columns[columns.length - 1], ...columns.slice(0, columns.length - 1)];
    };

    return (
        <div className="p-6">
            <div className={`flex flex-col ${i18n.language === 'ar' ? 'items-end' : 'items-start'} md:flex-row md:justify-between md:items-center mb-4`}>
                <h1 className="text-2xl font-bold">{t('addProperty.propertiesList')}</h1>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded mt-2 md:mt-0"
                >
                    {t('addProperty.addProperty')}
                </button>
            </div>
            <div className={`flex ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'} mb-4`}>
                <input
                    type="text"
                    placeholder={t('addProperty.searchPlaceholder')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`px-3 py-2 border rounded w-full max-w-md ${i18n.language === 'ar' ? 'text-right' : ''}`}
                />
            </div>
            {loading ? (
                <div className="text-center py-8">{t('loading')}</div>
            ) : error ? (
                <div className="text-center text-red-600 py-8">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed border" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                        <thead>
                            <tr>
                                {getTableColumns().map(col => (
                                    <th key={col.key} className={`border px-4 py-2 text-right ${col.width}`}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProperties.map((property) => (
                                <tr key={property._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/properties/${property._id}`)}>
                                    {getTableColumns().map(col => (
                                        <td key={col.key} className={`border px-4 py-2 text-right align-middle ${col.width}`}>{col.render(property)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Property' : 'Add Property'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Title"
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Description"
                                className="w-full border px-3 py-2 rounded"
                                required
                                rows="3"
                            />
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded"
                                required
                            >
                                <option value="">{t('addProperty.typePlaceholder')}</option>
                                {propertyTypes.map(type => (
                                    <option key={type} value={type}>{t(`addProperty.types.${type}`)}</option>
                                ))}
                            </select>
                            <input
                                name="price"
                                type="number"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="Price"
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                            <input
                                name="area"
                                type="number"
                                value={form.area}
                                onChange={handleChange}
                                placeholder="Area (sq ft)"
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                            <input
                                name="location.address"
                                value={form.location.address}
                                onChange={handleChange}
                                placeholder="Address"
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                            <input
                                name="location.city"
                                value={form.location.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                            <input
                                name="location.state"
                                value={form.location.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                            <input
                                name="location.country"
                                value={form.location.country}
                                onChange={handleChange}
                                placeholder="Country"
                                className="w-full border px-3 py-2 rounded"
                                required
                            />

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Images (Max 5)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full"
                                />
                                {previewUrls.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <input
                                name="bedrooms"
                                type="number"
                                value={form.bedrooms}
                                onChange={handleChange}
                                placeholder="Bedrooms"
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                            <input
                                name="bathrooms"
                                type="number"
                                value={form.bathrooms}
                                onChange={handleChange}
                                placeholder="Bathrooms"
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={form.featured}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Featured
                            </label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                {amenitiesList.map(amenity => (
                                    <label key={amenity} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="amenities"
                                            value={amenity}
                                            checked={form.amenities && form.amenities.includes(amenity)}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        {t(`addProperty.amenitiesList.${amenity}`)}
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditId(null);
                                        setSelectedImages([]);
                                        setPreviewUrls([]);
                                    }}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >Cancel</button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : (editId ? 'Update Property' : 'Add Property')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Properties; 