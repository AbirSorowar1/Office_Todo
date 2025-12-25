import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    CheckSquare,
    Calendar,
    Clock,
    TrendingUp,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import Card from '../../components/shared/Card';
import { database } from '../../firebase/config';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';

const DashboardOverview = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        upcomingMeetings: 0,
        pendingLeaves: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    const isOwner = localStorage.getItem('isOwner') === 'true';

    useEffect(() => {
        const tasksRef = ref(database, 'tasks');
        const tasksQuery = query(tasksRef, orderByChild('userId'), limitToLast(20));

        const unsubscribeTasks = onValue(tasksQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                let tasksList = Object.entries(data)
                    .map(([id, task]) => ({ id, ...task }));

                if (!isOwner && currentUser) {
                    tasksList = tasksList.filter(task => task.userId === currentUser.uid);
                }

                setRecentTasks(tasksList.slice(0, 5));

                const total = tasksList.length;
                const completed = tasksList.filter(t => t.status === 'completed').length;

                setStats(prev => ({ ...prev, totalTasks: total, completedTasks: completed }));
            }
            setLoading(false);
        });

        const meetingsRef = ref(database, 'meetings');
        const unsubscribeMeetings = onValue(meetingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                let meetingsList = Object.entries(data)
                    .map(([id, meeting]) => ({ id, ...meeting }))
                    .filter(meeting => {
                        const meetingDate = new Date(meeting.date);
                        return meetingDate >= new Date();
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5);

                setUpcomingMeetings(meetingsList);
                setStats(prev => ({ ...prev, upcomingMeetings: meetingsList.length }));
            }
        });

        return () => {
            unsubscribeTasks();
            unsubscribeMeetings();
        };
    }, [currentUser, isOwner]);

    const statCards = [
        {
            title: 'Total Tasks',
            value: stats.totalTasks,
            icon: CheckSquare,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Completed',
            value: stats.completedTasks,
            icon: TrendingUp,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Upcoming Meetings',
            value: stats.upcomingMeetings,
            icon: Calendar,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Hours This Week',
            value: '32h',
            icon: Clock,
            color: 'bg-orange-500',
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in-progress': return 'bg-blue-100 text-blue-700';
            case 'todo': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-orange-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    // Fallback avatar (ui-avatars)
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        currentUser?.displayName || currentUser?.email || 'User'
    )}&background=6366f1&color=fff&size=160&bold=true&rounded=true`;

    const googlePhotoUrl = currentUser?.photoURL
        ? currentUser.photoURL.replace(/=s\d+-c?/, '=s160-c')
        : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header - Professional Style like your screenshot */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-6">
                    {/* Profile Section */}
                    <div className="relative">
                        <img
                            src={googlePhotoUrl || fallbackAvatar}
                            alt={currentUser?.displayName || 'User'}
                            referrerPolicy="no-referrer"
                            className="w-24 h-24 rounded-full object-cover border-4 border-white/40 shadow-2xl"
                            onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                        />
                        {/* Online Indicator */}
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-4 border-white"></div>
                    </div>

                    {/* Name & Role */}
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3">
                            {currentUser?.displayName || 'User'}
                            <span className="text-2xl">👋</span>
                        </h1>
                        <p className="text-xl text-blue-100 mt-1 opacity-90">
                            {isOwner ? 'Owner' : 'Employee'}
                        </p>
                        <p className="text-lg text-blue-100 mt-4">
                            Here's what's happening with your work today.
                        </p>
                    </div>
                </div>

                {/* Owner Badge - Optional, right side */}
                {isOwner && (
                    <div className="absolute top-8 right-8">
                        <span className="px-6 py-3 bg-yellow-300 text-yellow-900 rounded-full font-bold text-lg shadow-xl">
                            Owner Mode
                        </span>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                    <Icon className={stat.textColor} size={24} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <Card
                    title="Recent Tasks"
                    headerAction={
                        <button
                            onClick={() => navigate('/dashboard/tasks')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                            View All <ArrowRight size={16} />
                        </button>
                    }
                >
                    {recentTasks.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckSquare size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No tasks yet</p>
                            <button
                                onClick={() => navigate('/dashboard/tasks')}
                                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Create your first task
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                    onClick={() => navigate('/dashboard/tasks')}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {task.title}
                                            </h4>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {task.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {task.priority?.toUpperCase()} Priority
                                            </span>
                                            {task.dueDate && (
                                                <span className="text-xs text-gray-500">
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Upcoming Meetings */}
                <Card
                    title="Upcoming Meetings"
                    headerAction={
                        <button
                            onClick={() => navigate('/dashboard/meetings')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                            View All <ArrowRight size={16} />
                        </button>
                    }
                >
                    {upcomingMeetings.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No upcoming meetings</p>
                            <button
                                onClick={() => navigate('/dashboard/meetings')}
                                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Schedule a meeting
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingMeetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                    onClick={() => navigate('/dashboard/meetings')}
                                >
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Calendar size={20} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">
                                            {meeting.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                                        </p>
                                        {meeting.participants && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {meeting.participants.length} participants
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick Actions */}
            <Card title="Quick Actions">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: 'New Task', icon: CheckSquare, path: '/dashboard/tasks', color: 'blue' },
                        { name: 'Schedule Meeting', icon: Calendar, path: '/dashboard/meetings', color: 'purple' },
                        { name: 'Apply Leave', icon: AlertCircle, path: '/dashboard/leaves', color: 'orange' },
                        { name: 'Time Log', icon: Clock, path: '/dashboard/time-tracker', color: 'green' }
                    ].map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => navigate(action.path)}
                                className={`p-4 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-lg transition-colors text-center group`}
                            >
                                <Icon className={`text-${action.color}-600 mx-auto mb-2 group-hover:scale-110 transition-transform`} size={24} />
                                <p className={`text-sm font-medium text-${action.color}-900`}>
                                    {action.name}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default DashboardOverview;