import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyService, bookingService } from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Calendar from 'react-calendar';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'react-calendar/dist/Calendar.css';
import { emailService } from '../services/emailService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FaComments, FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useChat } from '../context/ChatContext';

const PropertyDetails = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { createOrGetChat, setActiveChat } = useChat();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState([new Date(), new Date()]);
    const [bookings, setBookings] = useState([]);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bookingSummary, setBookingSummary] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [paymentError, setPaymentError] = useState('');

    useEffect(() => {
        fetchPropertyDetails();
    }, [id]);

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getPropertyById(id);
            setProperty(response.data);
            await fetchBookings();
        } catch (err) {
            setError('Failed to load property details');
            toast.error('Failed to load property details');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await bookingService.getPropertyBookings(id);
            if (response.data) {
                setBookings(response.data);
            } else {
                setBookings([]);
            }
        } catch (err) {
            console.error('Failed to load bookings:', err);
            setBookings([]);
        }
    };

    const calculateBookingSummary = () => {
        if (!dateRange[0] || !dateRange[1] || !property) return null;

        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        const totalAmount = property.price * days;
        const depositAmount = totalAmount * 0.25;
        return {
            startDate,
            endDate,
            days,
            totalAmount,
            depositAmount
        };
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const summary = calculateBookingSummary();
        if (!summary) return;

        setBookingSummary(summary);
        setShowPaymentModal(true);
    };

    const handlePayment = async (paymentMethod) => {
        try {
            setPaymentStatus('processing');
            setPaymentError('');
            const summary = calculateBookingSummary();
            if (!summary) {
                throw new Error('Invalid booking summary');
            }
            if (!property || property.status !== 'active') {
                throw new Error('Property is not available for booking');
            }
            const checkIn = new Date(dateRange[0]);
            const checkOut = new Date(dateRange[1]);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(23, 59, 59, 999);
            const bookingData = {
                propertyId: id,
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
                paymentMethod,
                totalAmount: summary.totalAmount,
                depositAmount: summary.depositAmount,
                totalNights: summary.days
            };
            const response = await bookingService.createBooking(bookingData);
            toast.success('Booking created successfully!');
            setPaymentStatus('success');
            setShowPaymentModal(false);
            navigate(`/bookings`);
        } catch (err) {
            setPaymentStatus('error');
            setPaymentError(
                err.response?.data?.message ||
                err.message ||
                'Failed to process payment. Please try again.'
            );
            toast.error(err.response?.data?.message || err.message || 'Failed to process payment.');
        }
    };

    const tileClassName = ({ date }) => {
        const isBooked = bookings.some(booking => {
            const bookingStart = new Date(booking.checkIn);
            const bookingEnd = new Date(booking.checkOut);
            return date >= bookingStart && date <= bookingEnd;
        });

        return isBooked ? 'bg-red-100' : 'bg-green-100';
    };

    // Helper to check if the current user is the owner
    const isOwner = user && property && user._id === property.owner._id;

    // Handler to start chat with owner
    const handleStartChat = async () => {
        if (!isAuthenticated) {
            toast.error(t('propertyDetails.loginToChat'));
            navigate('/login');
            return;
        }
        try {
            const chat = await createOrGetChat(property._id, property.owner._id);
            setActiveChat(chat);
            window.dispatchEvent(new Event('openChatWidget'));
        } catch (err) {
            toast.error('Failed to start chat');
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;

    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
    if (!property) return <div className="text-center p-4">{t('propertyDetails.notFound')}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Image Slider */}
            <div className="mb-10 rounded-3xl overflow-hidden shadow-lg border border-primary-100">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000 }}
                    onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                >
                    {property.images.map((image, index) => (
                        <SwiperSlide key={index}>
                            <img
                                src={image.url}
                                alt={`${property.title} - Image ${index + 1}`}
                                className="w-full h-[400px] md:h-[500px] object-cover"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Property Details */}
                <div className="lg:col-span-2">
                    <h1 className="text-4xl font-extrabold text-primary-900 mb-4 tracking-tight">{property.title}</h1>
                    <p className="text-primary-700 mb-8 text-lg">{property.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-primary-50 p-6 rounded-2xl shadow-sm">
                            <p className="text-sm text-primary-500">{t('propertyDetails.pricePerNight')}</p>
                            <p className="text-2xl font-bold text-primary-800">${property.price}</p>
                        </div>
                        <div className="bg-primary-50 p-6 rounded-2xl shadow-sm">
                            <p className="text-sm text-primary-500">{t('propertyDetails.bedrooms')}</p>
                            <p className="text-2xl font-bold text-primary-800">{property.bedrooms}</p>
                        </div>
                        <div className="bg-primary-50 p-6 rounded-2xl shadow-sm">
                            <p className="text-sm text-primary-500">{t('propertyDetails.bathrooms')}</p>
                            <p className="text-2xl font-bold text-primary-800">{property.bathrooms}</p>
                        </div>
                        <div className="bg-primary-50 p-6 rounded-2xl shadow-sm">
                            <p className="text-sm text-primary-500">{t('propertyDetails.area')}</p>
                            <p className="text-2xl font-bold text-primary-800">{property.area} m²</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-3 text-primary-900">{t('propertyDetails.location')}</h2>
                        <p className="text-primary-700 text-lg">
                            {property.location.address}, {property.location.city}, {property.location.state}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-3 text-primary-900">{t('propertyDetails.amenities')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {(() => {
                                let amenitiesArray = [];
                                if (typeof property.amenities === 'string') {
                                    // Try to parse if it's a JSON array string
                                    if (property.amenities.trim().startsWith('[') && property.amenities.trim().endsWith(']')) {
                                        try {
                                            amenitiesArray = JSON.parse(property.amenities);
                                        } catch {
                                            amenitiesArray = [];
                                        }
                                    } else {
                                        // If it's a comma-separated string, split it
                                        amenitiesArray = property.amenities.split(',').map(a => a.trim());
                                    }
                                } else if (Array.isArray(property.amenities)) {
                                    amenitiesArray = property.amenities;
                                }
                                if (!Array.isArray(amenitiesArray) || amenitiesArray.length === 0) {
                                    return <span className="text-gray-400">{t('propertyDetails.noAmenities') || 'No amenities listed'}</span>;
                                }
                                return amenitiesArray.map((amenity, index) => (
                                    <div key={index} className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-primary-700 text-base">{t(`addProperty.amenitiesList.${amenity}`)}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                {/* Booking Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-primary-100">
                        <h2 className="text-2xl font-bold mb-6 text-primary-900">{t('propertyDetails.bookProperty')}</h2>
                        <div className="mb-8">
                            <Calendar
                                onChange={setDateRange}
                                value={dateRange}
                                tileClassName={tileClassName}
                                minDate={new Date()}
                                selectRange={true}
                                className="w-full border rounded-2xl"
                            />
                        </div>

                        {dateRange[0] && dateRange[1] && (
                            <div className="mb-8">
                                <h3 className="font-semibold mb-2 text-primary-800">{t('propertyDetails.bookingSummary')}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>{t('propertyDetails.checkIn')}:</span>
                                        <span>{dateRange[0].toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('propertyDetails.checkOut')}:</span>
                                        <span>{dateRange[1].toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('propertyDetails.totalNights')}:</span>
                                        <span>{Math.ceil((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24))}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>{t('propertyDetails.totalAmount')}:</span>
                                        <span>${property.price * Math.ceil((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24))}</span>
                                    </div>
                                    <div className="flex justify-between text-primary-600">
                                        <span>{t('propertyDetails.requiredDeposit')}:</span>
                                        <span>${(property.price * Math.ceil((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24)) * 0.25).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 mt-6">
                            {!isOwner && (
                                <button
                                    onClick={handleStartChat}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors w-full"
                                >
                                    <FaComments className="text-lg" />
                                    <span className="font-semibold">{t('propertyDetails.chatWithOwner')}</span>
                                </button>
                            )}
                            <button
                                onClick={handleBooking}
                                disabled={!dateRange[0] || !dateRange[1]}
                                className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-lg transition-colors"
                            >
                                {t('propertyDetails.bookProperty')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{t('propertyDetails.contactInfo')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                        <FaUser className="text-blue-500" />
                        <span>{property.owner.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <FaPhone className="text-blue-500" />
                        <span>{property.owner.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <FaEnvelope className="text-blue-500" />
                        <span>{property.owner.email}</span>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-primary-100">
                        <h2 className="text-2xl font-bold mb-4 text-primary-900">{t('propertyDetails.bookProperty')}</h2>

                        {paymentStatus === 'pending' && (
                            <div>
                                <p className="mb-4 text-primary-700">{t('propertyDetails.selectPaymentMethod')}</p>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => handlePayment('vodafone_cash')}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 font-semibold"
                                    >
                                        {t('propertyDetails.payWithVodafoneCash')}
                                    </button>
                                    <button
                                        onClick={() => handlePayment('mizza')}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 font-semibold"
                                    >
                                        {t('propertyDetails.payWithMizza')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {paymentStatus === 'processing' && (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                                <p className="text-primary-700">{t('propertyDetails.processingPayment')}</p>
                            </div>
                        )}

                        {paymentStatus === 'error' && (
                            <div className="text-center text-red-600">
                                <p className="mb-4">{paymentError}</p>
                                <button
                                    onClick={() => setPaymentStatus('pending')}
                                    className="bg-primary-600 text-white py-2 px-4 rounded-xl hover:bg-primary-700 font-semibold"
                                >
                                    {t('common.tryAgain')}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="mt-4 text-primary-600 hover:text-primary-800 font-semibold"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetails;