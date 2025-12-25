import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { Users, Mail, Phone, MapPin, Search, Briefcase } from 'lucide-react';
import Card from '../../components/shared/Card';

const EmployeeDirectory = () => {
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = ref(database, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const employeesList = Object.entries(data).map(([id, user]) => ({
                    id,
                    ...user
                }));
                setEmployees(employeesList);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch =
            emp.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.department?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment =
            filterDepartment === 'all' || emp.department === filterDepartment;

        return matchesSearch && matchesDepartment;
    });

    const departments = [...new Set(employees.map((e) => e.department))].filter(Boolean);

    const stats = {
        total: employees.length,
        active: employees.filter((e) => e.status === 'active').length,
        departments: departments.length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
                <p className="text-gray-600 mt-1">Browse and connect with team members</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total Employees</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
                        </div>
                        <Users className="text-blue-600" size={32} />
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Active</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">{stats.active}</p>
                        </div>
                        <Users className="text-green-600" size={32} />
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-medium">Departments</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">{stats.departments}</p>
                        </div>
                        <Briefcase className="text-purple-600" size={32} />
                    </div>
                </Card>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            <Card title="Team Members">
                {filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                        <Users size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No employees found</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEmployees.map((employee) => (
                            <div
                                key={employee.id}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <img
                                        src={employee.photoURL || 'https://via.placeholder.com/48'}
                                        alt={employee.displayName}
                                        className="w-12 h-12 rounded-full ring-2 ring-blue-100"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {employee.displayName}
                                        </h3>
                                        <p className="text-sm text-gray-600 capitalize">{employee.role || 'Employee'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={14} />
                                        <span className="truncate">{employee.email}</span>
                                    </div>
                                    {employee.department && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Briefcase size={14} />
                                            <span>{employee.department}</span>
                                        </div>
                                    )}
                                    {employee.status && (
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${employee.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {employee.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default EmployeeDirectory;