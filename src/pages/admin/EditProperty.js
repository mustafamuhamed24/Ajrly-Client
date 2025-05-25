import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [newImages, setNewImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPropertyById(id);
            setProperty(data);
        } catch (err) {
            setError('Failed to load property');
            console.error('Fetch property error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (field, value) => {
        setEditingField(field);
        setEditValue(value);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const updatedProperty = { ...property };

            if (editingField && editingField.includes('.')) {
                const [parent, child] = editingField.split('.');
                updatedProperty[parent] = {
                    ...updatedProperty[parent],
                    [child]: editValue
                };
            } else if (editingField) {
                updatedProperty[editingField] = editValue;
            }

            console.log('Submitting update:', updatedProperty);

            // Create FormData for image upload
            const formData = new FormData();
            formData.append('data', JSON.stringify(updatedProperty));

            // Add new images
            for (let i = 0; i < newImages.length; i++) {
                formData.append('images', newImages[i]);
            }

            // Add removed image IDs
            if (removedImages.length > 0) {
                formData.append('removedImages', JSON.stringify(removedImages));
            }

            await adminService.updateProperty(id, formData);
            setProperty(updatedProperty);
            setEditingField(null);
            setNewImages([]);
            setRemovedImages([]);
        } catch (err) {
            setError('Failed to update property');
            console.error('Update property error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingField(null);
        setEditValue('');
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
    };

    const handleRemoveImage = (imageId) => {
        setRemovedImages(prev => [...prev, imageId]);
        setProperty(prev => ({
            ...prev,
            images: prev.images.filter(img => img._id !== imageId)
        }));
    };

    if (loading && !property) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
    if (!property) return <div className="text-center py-8">Property not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Edit Property</h1>
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Property Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Unique ID</label>
                                <div className="mt-1 flex items-center">
                                    {editingField === 'uniqueId' ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <span className="flex-1">{property.uniqueId}</span>
                                    )}
                                    <button
                                        onClick={() => handleEdit('uniqueId', property.uniqueId)}
                                        className="ml-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <div className="mt-1 flex items-center">
                                    {editingField === 'title' ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <span className="flex-1">{property.title}</span>
                                    )}
                                    <button
                                        onClick={() => handleEdit('title', property.title)}
                                        className="ml-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <div className="mt-1">
                                    {editingField === 'description' ? (
                                        <textarea
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            rows="4"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <p className="whitespace-pre-wrap">{property.description}</p>
                                    )}
                                    <button
                                        onClick={() => handleEdit('description', property.description)}
                                        className="mt-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <div className="mt-1 flex items-center">
                                    {editingField === 'type' ? (
                                        <select
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="apartment">Apartment</option>
                                            <option value="house">House</option>
                                            <option value="villa">Villa</option>
                                            <option value="condo">Condo</option>
                                        </select>
                                    ) : (
                                        <span className="flex-1 capitalize">{property.type}</span>
                                    )}
                                    <button
                                        onClick={() => handleEdit('type', property.type)}
                                        className="ml-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                                <div className="mt-1 flex items-center">
                                    {editingField === 'price' ? (
                                        <input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            min="0"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <span className="flex-1">${property.price}</span>
                                    )}
                                    <button
                                        onClick={() => handleEdit('price', property.price)}
                                        className="ml-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                                    <div className="mt-1 flex items-center">
                                        {editingField === 'bedrooms' ? (
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                min="0"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        ) : (
                                            <span className="flex-1">{property.bedrooms}</span>
                                        )}
                                        <button
                                            onClick={() => handleEdit('bedrooms', property.bedrooms)}
                                            className="ml-2 text-primary-600 hover:text-primary-900"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                                    <div className="mt-1 flex items-center">
                                        {editingField === 'bathrooms' ? (
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                min="0"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        ) : (
                                            <span className="flex-1">{property.bathrooms}</span>
                                        )}
                                        <button
                                            onClick={() => handleEdit('bathrooms', property.bathrooms)}
                                            className="ml-2 text-primary-600 hover:text-primary-900"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Area (sq ft)</label>
                                    <div className="mt-1 flex items-center">
                                        {editingField === 'area' ? (
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                min="0"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        ) : (
                                            <span className="flex-1">{property.area}</span>
                                        )}
                                        <button
                                            onClick={() => handleEdit('area', property.area)}
                                            className="ml-2 text-primary-600 hover:text-primary-900"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <div className="mt-1 flex items-center">
                                    {editingField === 'status' ? (
                                        <select
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    ) : (
                                        <span className="flex-1 capitalize">{property.status}</span>
                                    )}
                                    <button
                                        onClick={() => handleEdit('status', property.status)}
                                        className="ml-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Location Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <div className="mt-1 flex items-center">
                                    {editingField === 'location.address' ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <span className="flex-1">{property.location.address}</span>
                                    )}
                                    <button
                                        onClick={() => handleEdit('location.address', property.location.address)}
                                        className="ml-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <div className="mt-1 flex items-center">
                                    {editingField === 'location.city' ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <span className="flex-1">{property.location.city}</span>
                                    )}
                                    <button
                                        onClick={() => handleEdit('location.city', property.location.city)}
                                        className="ml-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <div className="mt-1 flex items-center">
                                    {editingField === 'location.state' ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <span className="flex-1">{property.location.state}</span>
                                    )}
                                    <button
                                        onClick={() => handleEdit('location.state', property.location.state)}
                                        className="ml-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <div className="mt-1 flex items-center">
                                    {editingField === 'location.country' ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <span className="flex-1">{property.location.country}</span>
                                    )}
                                    <button
                                        onClick={() => handleEdit('location.country', property.location.country)}
                                        className="ml-2 text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Images</label>
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full"
                                    />
                                    <div className="mt-4 grid grid-cols-4 gap-4">
                                        {property.images.map((image) => (
                                            <div key={image._id} className="relative">
                                                <img
                                                    src={image.url}
                                                    alt="Property"
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() => handleRemoveImage(image._id)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        {newImages.map((image, index) => (
                                            <div key={`new-${index}`} className="relative">
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setNewImages(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {(editingField || newImages.length > 0 || removedImages.length > 0) && (
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={handleCancel}
                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditProperty; 