import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    Calendar,
    FileText,
    Megaphone,
    Clock,
    FolderOpen,
    LogOut,
    Briefcase,
    ChevronRight
} from 'lucide-react';

// Import the new logo image
import logoImage from '../layout/Minimalist AS Latter Logo.png'; // Adjust path if needed (relative to this Sidebar file)

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard/overview',
            color: 'text-blue-600'
        },
        {
            name: 'My Tasks',
            icon: CheckSquare,
            path: '/dashboard/tasks',
            color: 'text-green-600'
        },
        {
            name: 'Team Board',
            icon: Users,
            path: '/dashboard/team-board',
            color: 'text-purple-600'
        },
        {
            name: 'Meetings',
            icon: Calendar,
            path: '/dashboard/meetings',
            color: 'text-orange-600'
        },
        {
            name: 'Leave Management',
            icon: FileText,
            path: '/dashboard/leaves',
            color: 'text-red-600'
        },
        {
            name: 'Announcements',
            icon: Megaphone,
            path: '/dashboard/announcements',
            color: 'text-yellow-600'
        },
        {
            name: 'Employee Directory',
            icon: Users,
            path: '/dashboard/directory',
            color: 'text-indigo-600'
        },
        {
            name: 'Time Tracker',
            icon: Clock,
            path: '/dashboard/time-tracker',
            color: 'text-teal-600'
        },
        {
            name: 'Documents',
            icon: FolderOpen,
            path: '/dashboard/documents',
            color: 'text-pink-600'
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
          w-72 bg-white border-r border-gray-200 flex flex-col
        `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
                    {/* Replaced the gradient box + icon with your custom logo image */}
                    <img
                        src={logoImage}
                        alt="Update Todo Logo"
                        className=" h-20 w-20 object-contain" // Same size as before (40x40 approx), adjust if needed
                    />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Update <span className="text-blue-600">Todo</span>
                        </h1>
                        <p className="text-xs text-gray-500">Abir Sorowar</p>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <img
                            src={currentUser?.photoURL || 'https://via.placeholder.com/40'}
                            alt={currentUser?.displayName}
                            className="w-10 h-10 rounded-full ring-2 ring-blue-100"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {currentUser?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {currentUser?.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive
                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                  `}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon size={20} className={isActive ? item.color : ''} />
                                            <span className="flex-1">{item.name}</span>
                                            {isActive && (
                                                <ChevronRight size={16} className="text-blue-600" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;