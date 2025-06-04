import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
    const { t } = useTranslation();
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? null : index);
    };

    const faqSections = [
        {
            title: t('faq.general.title', 'General Questions'),
            questions: [
                {
                    q: t('faq.general.q1', 'What is Ajrly?'),
                    a: t('faq.general.a1', 'Ajrly is a comprehensive real estate platform that connects property owners with potential tenants and buyers. We provide a seamless experience for property management, booking, and real estate transactions.')
                },
                {
                    q: t('faq.general.q2', 'How do I get started with Ajrly?'),
                    a: t('faq.general.a2', 'Getting started is easy! Simply create an account, complete your profile, and you can start browsing properties or listing your own property for rent or sale.')
                },
                {
                    q: t('faq.general.q3', 'Is Ajrly available in my country?'),
                    a: t('faq.general.a3', 'Ajrly is currently available in multiple countries. You can check our website for the complete list of supported locations.')
                }
            ]
        },
        {
            title: t('faq.property.title', 'Property Related'),
            questions: [
                {
                    q: t('faq.property.q1', 'How do I list my property?'),
                    a: t('faq.property.a1', 'To list your property, log in to your account, go to the admin dashboard, and click on "Add Property". Fill in the required details, upload photos, and submit for review.')
                },
                {
                    q: t('faq.property.q2', 'What types of properties can I list?'),
                    a: t('faq.property.a2', 'You can list various types of properties including apartments, villas, houses, and condos. Each property type has specific requirements and features.')
                },
                {
                    q: t('faq.property.q3', 'How long does property approval take?'),
                    a: t('faq.property.a3', 'Property listings are typically reviewed within 24-48 hours. We verify all information and photos to ensure quality and accuracy.')
                }
            ]
        },
        {
            title: t('faq.booking.title', 'Booking and Payments'),
            questions: [
                {
                    q: t('faq.booking.q1', 'How do I book a property?'),
                    a: t('faq.booking.a1', 'To book a property, select your desired dates, review the property details, and click "Book Now". You\'ll need to provide payment information and confirm your booking.')
                },
                {
                    q: t('faq.booking.q2', 'What payment methods are accepted?'),
                    a: t('faq.booking.a2', 'We accept various payment methods including credit cards, debit cards, and bank transfers. All payments are processed securely through our platform.')
                },
                {
                    q: t('faq.booking.q3', 'What is the cancellation policy?'),
                    a: t('faq.booking.a3', 'Cancellation policies vary by property. You can find the specific cancellation policy for each property in its listing details. Generally, cancellations made 48 hours before check-in are fully refundable.')
                }
            ]
        },
        {
            title: t('faq.account.title', 'Account and Security'),
            questions: [
                {
                    q: t('faq.account.q1', 'How do I reset my password?'),
                    a: t('faq.account.a1', 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.')
                },
                {
                    q: t('faq.account.q2', 'How can I update my profile information?'),
                    a: t('faq.account.a2', 'Log in to your account, go to your profile page, and click "Edit Profile". You can update your personal information, contact details, and preferences.')
                },
                {
                    q: t('faq.account.q3', 'Is my personal information secure?'),
                    a: t('faq.account.a3', 'Yes, we take security seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent.')
                }
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold mb-8 text-primary-800">
                {t('footer.faq', 'Frequently Asked Questions')}
            </h1>
            <div className="space-y-8">
                {faqSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold p-6 text-primary-700 border-b">
                            {section.title}
                        </h2>
                        <div className="divide-y">
                            {section.questions.map((item, index) => (
                                <div key={index} className="p-6">
                                    <button
                                        onClick={() => toggleSection(`${sectionIndex}-${index}`)}
                                        className="w-full flex justify-between items-center text-left"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {item.q}
                                        </h3>
                                        <span className="ml-6 flex-shrink-0">
                                            <i className={`fas fa-chevron-${openSection === `${sectionIndex}-${index}` ? 'up' : 'down'} text-primary-600`}></i>
                                        </span>
                                    </button>
                                    {openSection === `${sectionIndex}-${index}` && (
                                        <div className="mt-4 text-gray-600">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ; 