import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    UserGroupIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

const AdminNav = () => {
    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Properties', href: '/admin/properties', icon: BuildingOfficeIcon },
        { name: 'Bookings', href: '/admin/bookings', icon: CalendarIcon },
        { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
        { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
    ];

    return (
        <nav className="bg-white shadow-lg rounded-2xl p-4">
            <div className="space-y-1">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon
                            className={`mr-3 h-6 w-6 flex-shrink-0 ${location.pathname === item.href
                                    ? 'text-primary-600'
                                    : 'text-gray-400 group-hover:text-gray-500'
                                }`}
                            aria-hidden="true"
                        />
                        {item.name}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default AdminNav; 