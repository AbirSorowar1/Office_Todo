import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { database } from '../../firebase/config';
import { ref, push, set, onValue, remove } from 'firebase/database';
import { Plus, Megaphone, Trash2, AlertCircle, Info, CheckCircle } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';

const Announcements = () => {
    const { currentUser } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'info',
        priority: 'normal'
    });

    useEffect(() => {
        const announcementsRef = ref(database, 'announcements');
        const unsubscribe = onValue(announcementsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const announcementsList = Object.entries(data)
                    .map(([id, announcement]) => ({ id, ...announcement }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAnnouncements(announcementsList);
            } else {
                setAnnouncements([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const announcementsRef = ref(database, 'announcements');
            const newAnnouncementRef = push(announcementsRef);
            await set(newAnnouncementRef, {
                ...formData,
                author: currentUser.displayName,
                authorId: currentUser.uid,
                createdAt: new Date().toISOString()
            });
            setFormData({ title: '', content: '', type: 'info', priority: 'normal' });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating announcement:', error);
        }
    };

    const handleDelete = async (announcementId) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await remove(ref(database, `announcements/${announcementId}`));
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    const getAnnouncementIcon = (type) => {
        switch (type) {
            case 'urgent':
                return <AlertCircle className="text-red-600" size={24} />;
            case 'success':
                return <CheckCircle className="text-green-600" size={24} />;
            default:
                return <Info className="text-blue-600" size={24} />;
        }
    };

    const getAnnouncementColor = (type) => {
        switch (type) {
            case 'urgent':
                return 'border-l-4 border-l-red-500 bg-red-50';
            case 'success':
                return 'border-l-4 border-l-green-500 bg-green-50';
            default:
                return 'border-l-4 border-l-blue-500 bg-blue-50';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-600 mt-1">Company-wide announcements and updates</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                    New Announcement
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{announcements.length}</p>
                        </div>
                        <Megaphone className="text-blue-600" size={32} />
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700 font-medium">Urgent</p>
                            <p className="text-3xl font-bold text-red-900 mt-1">
                                {announcements.filter((a) => a.type === 'urgent').length}
                            </p>
                        </div>
                        <AlertCircle className="text-red-600" size={32} />
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">This Week</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">
                                {announcements.filter((a) => {
                                    const weekAgo = new Date();
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    return new Date(a.createdAt) > weekAgo;
                                }).length}
                            </p>
                        </div>
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                </Card>
            </div>

            <Card title="All Announcements">
                {announcements.length === 0 ? (
                    <div className="text-center py-12">
                        <Megaphone size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">No announcements yet</p>
                        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                            Create Announcement
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`p-4 rounded-lg ${getAnnouncementColor(announcement.type)}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-white rounded-lg">
                                        {getAnnouncementIcon(announcement.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {announcement.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    By {announcement.author} • {new Date(announcement.createdAt).toLocaleDateString()} at{' '}
                                                    {new Date(announcement.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            {announcement.authorId === currentUser.uid && (
                                                <button
                                                    onClick={() => handleDelete(announcement.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${announcement.type === 'urgent'
                                                    ? 'bg-red-200 text-red-800'
                                                    : announcement.type === 'success'
                                                        ? 'bg-green-200 text-green-800'
                                                        : 'bg-blue-200 text-blue-800'
                                                }`}>
                                                {announcement.type.toUpperCase()}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${announcement.priority === 'high'
                                                    ? 'bg-orange-200 text-orange-800'
                                                    : 'bg-gray-200 text-gray-800'
                                                }`}>
                                                {announcement.priority === 'high' ? 'HIGH PRIORITY' : 'NORMAL'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Announcement"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter announcement title"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="5"
                            placeholder="Enter announcement content"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="info">Info</option>
                                <option value="urgent">Urgent</option>
                                <option value="success">Success</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" variant="primary" className="flex-1">
                            Post Announcement
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Announcements;