import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, Search, Settings } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
    const { currentUser } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="h-full flex items-center justify-between px-4 lg:px-6">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu size={24} className="text-gray-700" />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-80">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tasks, meetings, documents..."
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell size={22} className="text-gray-700" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Settings */}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings size={22} className="text-gray-700" />
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                        <img
                            src={currentUser?.photoURL || 'https://via.placeholder.com/40'}
                            alt={currentUser?.displayName}
                            className="w-9 h-9 rounded-full ring-2 ring-gray-200"
                        />
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">
                                {currentUser?.displayName}
                            </p>
                            <p className="text-xs text-gray-500">Employee</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;