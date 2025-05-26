import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const Properties = () => {
    const { t, i18n } = useTranslation();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        propertyType: ''
    });

    useEffect(() => {
        fetchProperties();
        // eslint-disable-next-line
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
                bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
            };
            const response = await propertyService.getProperties(params);
            setProperties(response.data || []);
        } catch (err) {
            setError('Failed to load properties');
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProperties();
    };

    const formatLocation = (location) => {
        if (!location) return '';
        const { address, city, state, country } = location;
        return `${address}, ${city}, ${state}, ${country}`;
    };

    if (loading) return <div className="flex justify-center items-center min-h-[40vh] text-lg font-semibold text-primary-600">{t('common.loading')}</div>;
    if (error) return <div className="text-center text-red-600 font-semibold py-8">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-extrabold mb-10 text-primary-800 tracking-tight">{t('properties.title', 'Find Your Next Home')}</h1>

            {/* Filters */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-10 bg-primary-50 p-4 rounded-2xl shadow-sm">
                <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder={t('properties.location', 'Location')}
                    className="border border-primary-200 p-3 rounded-xl focus:ring-2 focus:ring-primary-400 focus:outline-none text-sm"
                    aria-label={t('properties.location', 'Filter by location')}
                />
                <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder={t('properties.minPrice', 'Min Price')}
                    className="border border-primary-200 p-3 rounded-xl focus:ring-2 focus:ring-primary-400 focus:outline-none text-sm"
                    aria-label={t('properties.minPrice', 'Filter by minimum price')}
                />
                <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder={t('properties.maxPrice', 'Max Price')}
                    className="border border-primary-200 p-3 rounded-xl focus:ring-2 focus:ring-primary-400 focus:outline-none text-sm"
                    aria-label={t('properties.maxPrice', 'Filter by maximum price')}
                />
                <input
                    type="number"
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleFilterChange}
                    placeholder={t('properties.bedrooms', 'Bedrooms')}
                    className="border border-primary-200 p-3 rounded-xl focus:ring-2 focus:ring-primary-400 focus:outline-none text-sm"
                    aria-label={t('properties.bedrooms', 'Filter by bedrooms')}
                />
                <select
                    name="propertyType"
                    value={filters.propertyType}
                    onChange={handleFilterChange}
                    className="border border-primary-200 p-3 rounded-xl focus:ring-2 focus:ring-primary-400 focus:outline-none text-sm"
                    aria-label={t('properties.type', 'Filter by property type')}
                >
                    <option value="">{t('properties.allTypes', 'All Types')}</option>
                    <option value="apartment">{t('properties.types.apartment', 'Apartment')}</option>
                    <option value="villa">{t('properties.types.villa', 'Villa')}</option>
                    <option value="house">{t('properties.types.house', 'House')}</option>
                    <option value="condo">{t('properties.types.condo', 'Condo')}</option>
                </select>
                <button
                    type="submit"
                    className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                    <span>{t('common.search', 'Search')}</span>
                </button>
            </form>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.isArray(properties) && properties.map((property) => (
                    <Link
                        to={`/properties/${property._id}`}
                        key={property._id}
                        className="group block bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow border border-primary-100 focus:outline-none focus:ring-4 focus:ring-primary-200"
                        tabIndex={0}
                        aria-label={`${t('properties.viewDetails', 'View details for')} ${property.title}`}
                    >
                        <div className="relative h-56">
                            {Array.isArray(property.images) && property.images.length > 0 && property.images[0].url ? (
                                <img
                                    src={property.images[0].url}
                                    alt={property.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-property.jpg';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-primary-400">{t('properties.noImage', 'No image')}</span>
                                </div>
                            )}
                            {property.featured && (
                                <span className="absolute top-3 right-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow">
                                    {t('properties.featured', 'Featured')}
                                </span>
                            )}
                        </div>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-2 text-primary-900 group-hover:text-primary-600 transition-colors">{property.title}</h2>
                            <p className="text-primary-700 mb-2 text-sm">{formatLocation(property.location)}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xl font-bold text-primary-700">${property.price.toLocaleString()}</span>
                                <div className="flex space-x-2 text-primary-500 text-sm">
                                    <span>{property.bedrooms} {t('property.bedrooms', 'beds')}</span>
                                    <span>•</span>
                                    <span>{property.bathrooms} {t('property.bathrooms', 'baths')}</span>
                                    <span>•</span>
                                    <span>{property.area} {t('property.area', 'sq ft')}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {(!Array.isArray(properties) || properties.length === 0) && (
                <div className="text-center text-primary-400 mt-12 text-lg font-medium">
                    {t('common.noResults', 'No properties found matching your criteria')}
                </div>
            )}
        </div>
    );
};

export default Properties; 