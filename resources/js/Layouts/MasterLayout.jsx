import { usePage, Link } from '@inertiajs/react';
import { Menu, Divider } from '@mantine/core';
import { LogOutIcon, SettingsIcon, MenuIcon } from 'lucide-react';
import React from 'react';
import clsx from 'clsx';
import ApplicationLogo from '@/Components/ApplicationLogo';

const navItems = [
    { name: 'Home', link: '/dashboard' },
    { name: 'Categories', link: '/categories' },
    { name: 'Products', link: '/products' },
    { name: 'News & Events', link: '/news' },
    { name: 'Career', link: '/career' },
    { name: 'Enquiries', link: '/enquiries' },
];

const MasterLayout = ({ children }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const currentPath = usePage().url;

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="shadow-md bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo Section */}
                        <Link href='/' className="text-xl font-bold">
                            <ApplicationLogo className="h-10" />
                        </Link>

                        {/* Navigation Items */}
                        <div className="hidden md:flex space-x-2">
                            {navItems.map(({ name, link }) => (
                                <Link
                                    key={link}
                                    href={link}
                                    className={clsx(
                                        'text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium',
                                        { 'text-blue-600 font-semibold': currentPath === link }
                                    )}
                                >
                                    {name}
                                </Link>
                            ))}
                        </div>

                        {/* User Menu */}
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                                >
                                    {user?.name || 'User'}
                                    <svg
                                        className="-me-0.5 ms-2 h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>Profile</Menu.Label>
                                <Menu.Item leftSection={<SettingsIcon className="w-5 h-5" />}>
                                    <Link
                                        href={route('profile.edit')}
                                    >
                                        Settings
                                    </Link>
                                </Menu.Item>
                                <Divider />
                                <Menu.Item leftSection={<LogOutIcon className="w-5 h-5" />}>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                    >
                                        Logout
                                    </Link>
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                </div>
            </nav>
            <main className="p-6">{children}</main>
        </div>
    );
};

export default MasterLayout;
