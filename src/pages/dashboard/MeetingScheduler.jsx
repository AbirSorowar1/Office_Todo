import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { database } from '../../firebase/config';
import { ref, push, set, onValue, update, remove } from 'firebase/database';
import { Plus, Calendar, Clock, Users, Video, Trash2, Edit2, MoreVertical } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';

const MeetingScheduler = () => {
    const { currentUser } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '30',
        type: 'in-person',
        participants: []
    });

    useEffect(() => {
        const meetingsRef = ref(database, 'meetings');
        const unsubscribe = onValue(meetingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const meetingsList = Object.entries(data)
                    .map(([id, meeting]) => ({ id, ...meeting }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                setMeetings(meetingsList);
            } else {
                setMeetings([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMeeting) {
                await update(ref(database, `meetings/${editingMeeting.id}`), {
                    ...formData,
                    updatedAt: new Date().toISOString()
                });
            } else {
                const meetingsRef = ref(database, 'meetings');
                const newMeetingRef = push(meetingsRef);
                await set(newMeetingRef, {
                    ...formData,
                    organizer: currentUser.uid,
                    createdAt: new Date().toISOString()
                });
            }
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                duration: '30',
                type: 'in-person',
                participants: []
            });
            setIsModalOpen(false);
            setEditingMeeting(null);
        } catch (error) {
            console.error('Error saving meeting:', error);
        }
    };

    const handleDelete = async (meetingId) => {
        if (!window.confirm('Are you sure you want to delete this meeting?')) return;
        try {
            await remove(ref(database, `meetings/${meetingId}`));
        } catch (error) {
            console.error('Error deleting meeting:', error);
        }
    };

    const handleEdit = (meeting) => {
        setEditingMeeting(meeting);
        setFormData({
            title: meeting.title,
            description: meeting.description || '',
            date: meeting.date,
            time: meeting.time,
            duration: meeting.duration || '30',
            type: meeting.type || 'in-person',
            participants: meeting.participants || []
        });
        setIsModalOpen(true);
    };

    const upcomingMeetings = meetings.filter((m) => new Date(m.date + 'T' + m.time) >= new Date());
    const pastMeetings = meetings.filter((m) => new Date(m.date + 'T' + m.time) < new Date());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Meeting Scheduler</h1>
                    <p className="text-gray-600 mt-1">Schedule and manage team meetings</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                    Schedule Meeting
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total Meetings</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{meetings.length}</p>
                        </div>
                        <Calendar className="text-blue-600" size={32} />
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Upcoming</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">{upcomingMeetings.length}</p>
                        </div>
                        <Clock className="text-green-600" size={32} />
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700 font-medium">Completed</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{pastMeetings.length}</p>
                        </div>
                        <Users className="text-gray-600" size={32} />
                    </div>
                </Card>
            </div>

            {/* Upcoming Meetings List */}
            <Card title="Upcoming Meetings">
                {upcomingMeetings.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">No upcoming meetings</p>
                        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                            Schedule Meeting
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingMeetings.map((meeting) => (
                            <div
                                key={meeting.id}
                                className="relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 group"
                            >
                                <div className="flex items-start justify-between">
                                    {/* Left: Icon + Details */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div
                                            className={`p-3 rounded-xl shrink-0 ${meeting.type === 'video'
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : 'bg-blue-100 text-blue-600'
                                                }`}
                                        >
                                            {meeting.type === 'video' ? (
                                                <Video size={24} />
                                            ) : (
                                                <Users size={24} />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {meeting.title}
                                            </h3>
                                            {meeting.description && (
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {meeting.description}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={16} />
                                                    {new Date(meeting.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={16} />
                                                    {meeting.time} • {meeting.duration} min
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                    {meeting.type === 'video' ? 'Video Call' : 'In-Person'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Action Buttons (visible on hover) */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(meeting)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit meeting"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(meeting.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete meeting"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Modal for Create/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingMeeting(null);
                    setFormData({
                        title: '',
                        description: '',
                        date: '',
                        time: '',
                        duration: '30',
                        type: 'in-person',
                        participants: []
                    });
                }}
                title={editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="e.g. Weekly Team Sync"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="What's this meeting about?"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="15">15 min</option>
                                <option value="30">30 min</option>
                                <option value="45">45 min</option>
                                <option value="60">60 min</option>
                                <option value="90">90 min</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="in-person">In-Person</option>
                                <option value="video">Video Call</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" variant="primary" className="flex-1">
                            {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingMeeting(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MeetingScheduler;