import React from 'react';
import { useTranslation } from 'react-i18next';

const Privacy = () => {
    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold mb-8 text-primary-800">
                {t('footer.privacy', 'Privacy Policy')}
            </h1>
            <div className="prose prose-lg max-w-none">
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('privacy.introduction', 'Introduction')}
                    </h2>
                    <p className="text-gray-600">
                        {t('privacy.introText', 'At Ajrly, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.')}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('privacy.informationCollection', 'Information We Collect')}
                    </h2>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>{t('privacy.personalInfo', 'Personal information (name, email, phone number)')}</li>
                        <li>{t('privacy.propertyInfo', 'Property information and details')}</li>
                        <li>{t('privacy.bookingInfo', 'Booking and transaction information')}</li>
                        <li>{t('privacy.communicationInfo', 'Communication preferences and history')}</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('privacy.informationUse', 'How We Use Your Information')}
                    </h2>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>{t('privacy.use1', 'To provide and maintain our services')}</li>
                        <li>{t('privacy.use2', 'To process your bookings and transactions')}</li>
                        <li>{t('privacy.use3', 'To communicate with you about your account and services')}</li>
                        <li>{t('privacy.use4', 'To improve our platform and user experience')}</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('privacy.informationSharing', 'Information Sharing')}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {t('privacy.sharingText', 'We may share your information with:')}
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>{t('privacy.sharing1', 'Property owners and managers')}</li>
                        <li>{t('privacy.sharing2', 'Service providers and business partners')}</li>
                        <li>{t('privacy.sharing3', 'Legal authorities when required by law')}</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('privacy.security', 'Security')}
                    </h2>
                    <p className="text-gray-600">
                        {t('privacy.securityText', 'We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.')}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('privacy.contact', 'Contact Us')}
                    </h2>
                    <p className="text-gray-600">
                        {t('privacy.contactText', 'If you have any questions about this Privacy Policy, please contact us at privacy@ajrly.com')}
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Privacy; 