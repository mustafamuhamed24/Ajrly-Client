import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement contact form submission
        toast.success(t('contact.success', 'Message sent successfully!'));
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold mb-8 text-primary-800">
                {t('footer.contact', 'Contact Us')}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-primary-700">
                        {t('contact.sendMessage', 'Send us a Message')}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.name', 'Name')}
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth.email', 'Email')}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('contact.subject', 'Subject')}
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('contact.message', 'Message')}
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            {t('contact.send', 'Send Message')}
                        </button>
                    </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-primary-700">
                            {t('footer.contactInfo', 'Contact Information')}
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <i className="fas fa-map-marker-alt text-primary-600 text-xl"></i>
                                <span className="text-gray-600">123 Property Street, City, Country</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <i className="fas fa-phone text-primary-600 text-xl"></i>
                                <span className="text-gray-600">+1 234 567 890</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <i className="fas fa-envelope text-primary-600 text-xl"></i>
                                <span className="text-gray-600">info@ajrly.com</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-primary-700">
                            {t('contact.businessHours', 'Business Hours')}
                        </h2>
                        <div className="space-y-2 text-gray-600">
                            <p>{t('contact.weekdays', 'Monday - Friday: 9:00 AM - 6:00 PM')}</p>
                            <p>{t('contact.saturday', 'Saturday: 10:00 AM - 4:00 PM')}</p>
                            <p>{t('contact.sunday', 'Sunday: Closed')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact; 