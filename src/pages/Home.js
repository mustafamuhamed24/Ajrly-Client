import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Home = () => {
    const { t } = useTranslation();

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-50 to-primary-100 py-20">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-700 mb-4">
                        {t('landing.hero.title')}
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        {t('landing.hero.subtitle')}
                    </p>
                    <div>
                        <Link
                            to="/properties"
                            className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow hover:bg-primary-700 transition"
                        >
                            {t('landing.hero.searchButton')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Who We Are / About Section */}
            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-primary-700 mb-4">{t('about')}</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        {t('landing.about.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-8">
                        <div className="flex-1">
                            <div className="text-primary-600 mb-2 text-4xl">🏠</div>
                            <h3 className="font-semibold text-lg mb-1">{t('landing.features.feature1.title')}</h3>
                            <p className="text-gray-500">{t('landing.features.feature1.description')}</p>
                        </div>
                        <div className="flex-1">
                            <div className="text-primary-600 mb-2 text-4xl">🔒</div>
                            <h3 className="font-semibold text-lg mb-1">{t('landing.features.feature2.title')}</h3>
                            <p className="text-gray-500">{t('landing.features.feature2.description')}</p>
                        </div>
                        <div className="flex-1">
                            <div className="text-primary-600 mb-2 text-4xl">💬</div>
                            <h3 className="font-semibold text-lg mb-1">{t('landing.features.feature3.title')}</h3>
                            <p className="text-gray-500">{t('landing.features.feature3.description')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-primary-700 mb-4">{t('landing.plans.title')}</h2>
                    <p className="text-lg text-gray-600 mb-10">
                        {t('landing.plans.subtitle')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Basic Plan */}
                        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
                            <h3 className="text-xl font-bold text-primary-600 mb-2">{t('landing.plans.basic.title')}</h3>
                            <p className="text-gray-500 mb-4">{t('landing.plans.basic.description')}</p>
                            <ul className="text-gray-600 mb-6 space-y-2 text-left">
                                <li>✔️ {t('landing.plans.basic.features.search')}</li>
                                <li>✔️ {t('landing.plans.basic.features.photos')}</li>
                                <li>✔️ {t('landing.plans.basic.features.dashboard')}</li>
                            </ul>
                            <span className="text-2xl font-bold text-primary-600 mb-4">{t('landing.plans.basic.price')}</span>
                            <Link to="/register" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
                                {t('landing.plans.basic.button')}
                            </Link>
                        </div>
                        {/* Featured Plan */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-600 p-8 flex flex-col items-center scale-105">
                            <h3 className="text-xl font-bold text-primary-600 mb-2">{t('landing.plans.featured.title')}</h3>
                            <p className="text-gray-500 mb-4">{t('landing.plans.featured.description')}</p>
                            <ul className="text-gray-600 mb-6 space-y-2 text-left">
                                <li>⭐ {t('landing.plans.featured.features.priority')}</li>
                                <li>⭐ {t('landing.plans.featured.features.badge')}</li>
                                <li>⭐ {t('landing.plans.featured.features.analytics')}</li>
                            </ul>
                            <span className="text-2xl font-bold text-primary-600 mb-4">{t('landing.plans.featured.price')}</span>
                            <Link to="/register" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
                                {t('landing.plans.featured.button')}
                            </Link>
                        </div>
                        {/* Premium Plan */}
                        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
                            <h3 className="text-xl font-bold text-primary-600 mb-2">{t('landing.plans.premium.title')}</h3>
                            <p className="text-gray-500 mb-4">{t('landing.plans.premium.description')}</p>
                            <ul className="text-gray-600 mb-6 space-y-2 text-left">
                                <li>🚀 {t('landing.plans.premium.features.top')}</li>
                                <li>🚀 {t('landing.plans.premium.features.promotion')}</li>
                                <li>🚀 {t('landing.plans.premium.features.analytics')}</li>
                            </ul>
                            <span className="text-2xl font-bold text-primary-600 mb-4">{t('landing.plans.premium.price')}</span>
                            <Link to="/register" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
                                {t('landing.plans.premium.button')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home; 