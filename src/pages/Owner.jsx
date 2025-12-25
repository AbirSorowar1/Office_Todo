import React, { useEffect, useState } from 'react';
import { database } from '../firebase/config';
import { ref, onValue } from 'firebase/database';
import Card from '../components/shared/Card';
import { Briefcase, Users, Calendar, Clock, AlertCircle, Mail, CheckCircle, Info } from 'lucide-react';

const Owner = () => {
    const [tasks, setTasks] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    // Load Tasks
    useEffect(() => {
        const tasksRef = ref(database, 'tasks');
        const unsubscribe = onValue(tasksRef, snapshot => {
            const data = snapshot.val();
            setTasks(data ? Object.entries(data).map(([id, t]) => ({ id, ...t })) : []);
        });
        return () => unsubscribe();
    }, []);

    // Load Leaves
    useEffect(() => {
        const leavesRef = ref(database, 'leaves');
        const unsubscribe = onValue(leavesRef, snapshot => {
            const data = snapshot.val();
            setLeaves(data ? Object.entries(data).map(([id, l]) => ({ id, ...l })) : []);
        });
        return () => unsubscribe();
    }, []);

    // Load Employees
    useEffect(() => {
        const usersRef = ref(database, 'users');
        const unsubscribe = onValue(usersRef, snapshot => {
            const data = snapshot.val();
            setEmployees(data ? Object.entries(data).map(([id, u]) => ({ id, ...u })) : []);
        });
        return () => unsubscribe();
    }, []);

    // Load Meetings
    useEffect(() => {
        const meetingsRef = ref(database, 'meetings');
        const unsubscribe = onValue(meetingsRef, snapshot => {
            const data = snapshot.val();
            setMeetings(data ? Object.entries(data).map(([id, m]) => ({ id, ...m })) : []);
        });
        return () => unsubscribe();
    }, []);

    // Load Announcements
    useEffect(() => {
        const annRef = ref(database, 'announcements');
        const unsubscribe = onValue(annRef, snapshot => {
            const data = snapshot.val();
            setAnnouncements(data ? Object.entries(data).map(([id, a]) => ({ id, ...a })) : []);
        });
        return () => unsubscribe();
    }, []);

    // Stats calculations
    const leaveStats = {
        total: 20,
        used: leaves.filter(l => l.status === 'approved').reduce((acc, l) => {
            const duration = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            return acc + duration;
        }, 0),
        pending: leaves.filter(l => l.status === 'pending').length,
        remaining: 20 - leaves.filter(l => l.status === 'approved').reduce((acc, l) => {
            const duration = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            return acc + duration;
        }, 0)
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Owner Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center gap-2">
                        <Briefcase className="text-blue-600" size={24} />
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total Tasks</p>
                            <p className="text-2xl font-bold text-blue-900">{tasks.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center gap-2">
                        <Users className="text-green-600" size={24} />
                        <div>
                            <p className="text-sm text-green-700 font-medium">Employees</p>
                            <p className="text-2xl font-bold text-green-900">{employees.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-yellow-600" size={24} />
                        <div>
                            <p className="text-sm text-yellow-700 font-medium">Pending Leaves</p>
                            <p className="text-2xl font-bold text-yellow-900">{leaveStats.pending}</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100">
                    <div className="flex items-center gap-2">
                        <Clock className="text-red-600" size={24} />
                        <div>
                            <p className="text-sm text-red-700 font-medium">Upcoming Meetings</p>
                            <p className="text-2xl font-bold text-red-900">{meetings.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Leaves Detailed Card */}
            <Card title="Leaves Overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">Total Balance</p>
                        <p className="text-2xl font-bold text-blue-900">{leaveStats.total} days</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">Used</p>
                        <p className="text-2xl font-bold text-red-900">{leaveStats.used} days</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-700 font-medium">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">{leaveStats.pending}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">Remaining</p>
                        <p className="text-2xl font-bold text-green-900">{leaveStats.remaining} days</p>
                    </div>
                </div>
            </Card>

            {/* Announcements */}
            <Card title="Announcements">
                {announcements.length === 0 ? (
                    <p className="text-gray-500">No announcements yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {announcements.map(a => (
                            <li key={a.id} className="flex items-center gap-2">
                                <AlertCircle className="text-gray-400" size={16} />
                                <span>{a.title}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
};

export default Owner;
