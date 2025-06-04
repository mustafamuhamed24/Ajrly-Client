import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        <h1 className="text-9xl font-bold text-primary-600">404</h1>
                        <h2 className="mt-4 text-3xl font-bold text-gray-900">{t('notFound.title')}</h2>
                        <p className="mt-2 text-lg text-gray-600">{t('notFound.message')}</p>
                        <div className="mt-6">
                            <Link
                                to="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                {t('notFound.backHome')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 