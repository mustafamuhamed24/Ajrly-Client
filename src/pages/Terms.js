import React from 'react';
import { useTranslation } from 'react-i18next';

const Terms = () => {
    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold mb-8 text-primary-800">
                {t('footer.terms', 'Terms of Service')}
            </h1>
            <div className="prose prose-lg max-w-none">
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('terms.acceptance', 'Acceptance of Terms')}
                    </h2>
                    <p className="text-gray-600">
                        {t('terms.acceptanceText', 'By accessing and using Ajrly, you accept and agree to be bound by the terms and provision of this agreement.')}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('terms.useLicense', 'Use License')}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {t('terms.licenseText', 'Permission is granted to temporarily use Ajrly for personal, non-commercial transitory viewing only.')}
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>{t('terms.license1', 'You must not modify or copy the materials')}</li>
                        <li>{t('terms.license2', 'You must not use the materials for any commercial purpose')}</li>
                        <li>{t('terms.license3', 'You must not attempt to decompile or reverse engineer any software')}</li>
                        <li>{t('terms.license4', 'You must not remove any copyright or other proprietary notations')}</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('terms.userAccount', 'User Account')}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {t('terms.accountText', 'To use certain features of the platform, you must register for an account. You agree to:')}
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>{t('terms.account1', 'Provide accurate and complete information')}</li>
                        <li>{t('terms.account2', 'Maintain the security of your account')}</li>
                        <li>{t('terms.account3', 'Promptly update any changes to your information')}</li>
                        <li>{t('terms.account4', 'Accept responsibility for all activities under your account')}</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('terms.booking', 'Booking and Payments')}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {t('terms.bookingText', 'When making a booking through our platform:')}
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>{t('terms.booking1', 'You agree to pay all fees and charges')}</li>
                        <li>{t('terms.booking2', 'You understand our cancellation policy')}</li>
                        <li>{t('terms.booking3', 'You agree to comply with property rules')}</li>
                        <li>{t('terms.booking4', 'You acknowledge our refund policy')}</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('terms.liability', 'Limitation of Liability')}
                    </h2>
                    <p className="text-gray-600">
                        {t('terms.liabilityText', 'In no event shall Ajrly be liable for any damages arising out of the use or inability to use our platform.')}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('terms.changes', 'Changes to Terms')}
                    </h2>
                    <p className="text-gray-600">
                        {t('terms.changesText', 'We reserve the right to modify these terms at any time. We will notify users of any material changes.')}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-primary-700 mb-4">
                        {t('terms.contact', 'Contact Us')}
                    </h2>
                    <p className="text-gray-600">
                        {t('terms.contactText', 'If you have any questions about these Terms, please contact us at terms@ajrly.com')}
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms; 