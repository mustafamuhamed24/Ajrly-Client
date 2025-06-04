import React from 'react';
import { useTranslation } from 'react-i18next';

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold mb-8 text-primary-800">
                {t('footer.about', 'About Us')}
            </h1>
            <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-6">
                    {t('about.description', 'Ajrly is a leading real estate platform that connects property owners with potential tenants and buyers. Our mission is to make property management and real estate transactions seamless and efficient.')}
                </p>
                <h2 className="text-2xl font-bold text-primary-700 mb-4">
                    {t('about.ourMission', 'Our Mission')}
                </h2>
                <p className="text-gray-600 mb-6">
                    {t('about.missionDescription', 'We strive to provide a user-friendly platform that simplifies the process of finding, managing, and booking properties. Our goal is to create a trusted community where property owners and seekers can connect easily.')}
                </p>
                <h2 className="text-2xl font-bold text-primary-700 mb-4">
                    {t('about.ourValues', 'Our Values')}
                </h2>
                <ul className="list-disc pl-6 text-gray-600 mb-6">
                    <li>{t('about.value1', 'Trust and Transparency')}</li>
                    <li>{t('about.value2', 'Customer Satisfaction')}</li>
                    <li>{t('about.value3', 'Innovation and Technology')}</li>
                    <li>{t('about.value4', 'Community Building')}</li>
                </ul>
            </div>
        </div>
    );
};

export default About; 