import React from 'react';
import { useTranslation } from 'react-i18next';

const Loader = ({ fullScreen = false }) => {
    const { t } = useTranslation();

    return (
        <div className={`${fullScreen ? 'fixed inset-0' : 'relative'} flex items-center justify-center bg-white bg-opacity-75 z-50`}>
            <div className="flex flex-col items-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-100 rounded-full animate-pulse"></div>
                </div>
                <p className="mt-4 text-lg font-medium text-gray-600">{t('common.loading')}</p>
            </div>
        </div>
    );
};

export default Loader; 