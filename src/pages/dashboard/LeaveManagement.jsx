import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { database } from '../../firebase/config';
import { ref, push, set, onValue, update, remove } from 'firebase/database';
import { Plus, Calendar, CheckCircle, XCircle, Clock, Edit2, Info } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';

const LeaveManagement = () => {
    const { currentUser } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const totalLeaveBalance = 20;

    const [formData, setFormData] = useState({
        type: 'vacation',
        startDate: '',
        endDate: '',
        reason: ''
    });

    // Load leaves from Firebase
    useEffect(() => {
        if (!currentUser) return;
        const leavesRef = ref(database, 'leaves');
        const unsubscribe = onValue(leavesRef, snapshot => {
            const data = snapshot.val();
            if (data) {
                const userLeaves = Object.entries(data)
                    .filter(([_, leave]) => leave.userId === currentUser.uid)
                    .map(([id, leave]) => ({ id, ...leave }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setLeaves(userLeaves);
            } else {
                setLeaves([]);
            }
        });
        return () => unsubscribe();
    }, [currentUser]);

    // Calculate stats
    const usedDays = leaves
        .filter(l => l.status === 'approved')
        .reduce((acc, leave) => {
            const duration = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            return acc + duration;
        }, 0);
    const pendingDays = leaves
        .filter(l => l.status === 'pending')
        .reduce((acc, leave) => {
            const duration = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            return acc + duration;
        }, 0);
    const remainingDays = totalLeaveBalance - usedDays - pendingDays;

    // Handle leave submission (add/edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (duration > remainingDays) {
            alert(`You cannot apply for ${duration} day(s). Only ${remainingDays} day(s) remaining.`);
            return;
        }

        try {
            if (selectedLeave) {
                // Edit existing leave
                await update(ref(database, `leaves/${selectedLeave.id}`), {
                    ...formData,
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Add new leave (status pending)
                const newLeaveRef = push(ref(database, 'leaves'));
                await set(newLeaveRef, {
                    ...formData,
                    userId: currentUser.uid,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });
            }

            // Reset form
            setFormData({ type: 'vacation', startDate: '', endDate: '', reason: '' });
            setIsModalOpen(false);
            setSelectedLeave(null);
        } catch (error) {
            console.error('Error applying leave:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this leave?')) return;
        try {
            await remove(ref(database, `leaves/${id}`));
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (leave) => {
        setSelectedLeave(leave);
        setFormData({ ...leave });
        setIsModalOpen(true);
    };

    const handleInfo = (leave) => {
        setSelectedLeave(leave);
        setInfoModalOpen(true);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle className="text-green-600" size={20} />;
            case 'rejected': return <XCircle className="text-red-600" size={20} />;
            default: return <Clock className="text-yellow-600" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
                    <p className="text-gray-600 mt-1">Apply and track your leave requests</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                    Apply Leave
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <p className="text-sm text-blue-700 font-medium">Total Balance</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{totalLeaveBalance} days</p>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100">
                    <p className="text-sm text-red-700 font-medium">Used</p>
                    <p className="text-3xl font-bold text-red-900 mt-1">{usedDays} days</p>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <p className="text-sm text-yellow-700 font-medium">Pending</p>
                    <p className="text-3xl font-bold text-yellow-900 mt-1">{pendingDays} days</p>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <p className="text-sm text-green-700 font-medium">Remaining</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">{remainingDays} days</p>
                </Card>
            </div>

            {/* Leave History */}
            <Card title="Leave History">
                {leaves.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">No leave applications yet</p>
                        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Apply Leave</Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaves.map(leave => {
                            const duration = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                            return (
                                <div key={leave.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="p-3 bg-blue-100 rounded-lg">{getStatusIcon(leave.status)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 capitalize">{leave.type} Leave</h3>
                                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{leave.reason}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>From: {new Date(leave.startDate).toLocaleDateString()}</span>
                                            <span>To: {new Date(leave.endDate).toLocaleDateString()}</span>
                                            <span>Duration: {duration} days</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-2">
                                        <Button variant="secondary" size="sm" onClick={() => handleEdit(leave)}><Edit2 size={16} /> Edit</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(leave.id)}><XCircle size={16} /> Delete</Button>
                                        <Button variant="info" size="sm" onClick={() => handleInfo(leave)}><Info size={16} /> Info</Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Apply/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedLeave(null); }} title={selectedLeave ? 'Edit Leave' : 'Apply for Leave'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
                            <option value="vacation">Vacation</option>
                            <option value="sick">Sick Leave</option>
                            <option value="personal">Personal</option>
                            <option value="emergency">Emergency</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                            <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                            <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                        <textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" variant="primary" className="flex-1">{selectedLeave ? 'Update Leave' : 'Submit Application'}</Button>
                        <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setSelectedLeave(null) }}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            {/* Info Modal */}
            {selectedLeave && (
                <Modal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)} title="Leave Information">
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Type:</strong> {selectedLeave.type}</p>
                        <p><strong>Status:</strong> {selectedLeave.status}</p>
                        <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                        <p><strong>From:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                        <p><strong>To:</strong> {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                        <p><strong>Duration:</strong> {Math.ceil((new Date(selectedLeave.endDate) - new Date(selectedLeave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days</p>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default LeaveManagement;
