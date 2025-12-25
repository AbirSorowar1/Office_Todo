import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden">
                    <div className="p-4 lg:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;