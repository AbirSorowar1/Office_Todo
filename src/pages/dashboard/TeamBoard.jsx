import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { database } from '../../firebase/config';
import { ref, push, set, onValue, update, remove } from 'firebase/database';
import { Plus, Users, Trash2, Edit2, Check } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';

const TeamBoard = () => {
    const { currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'planning',
        team: []
    });

    const columns = [
        { id: 'planning', title: 'Planning', color: 'bg-blue-500' },
        { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
        { id: 'review', title: 'Review', color: 'bg-purple-500' },
        { id: 'completed', title: 'Completed', color: 'bg-green-500' }
    ];

    // Load projects
    useEffect(() => {
        const projectsRef = ref(database, 'projects');
        const unsubscribe = onValue(projectsRef, (snapshot) => {
            const data = snapshot.val();
            const list = data
                ? Object.entries(data).map(([id, p]) => ({ id, ...p, team: p.team || [] }))
                : [];
            setProjects(list);
        });
        return () => unsubscribe();
    }, []);

    // Load employees
    useEffect(() => {
        const usersRef = ref(database, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            const list = data
                ? Object.entries(data).map(([uid, user]) => ({ uid, ...user }))
                : [];
            setEmployees(list);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.title) return alert('Project title is required');

            if (editingProject) {
                await update(ref(database, `projects/${editingProject.id}`), {
                    ...formData,
                    updatedAt: new Date().toISOString()
                });
            } else {
                const newProjectRef = push(ref(database, 'projects'));
                await set(newProjectRef, {
                    ...formData,
                    createdBy: currentUser.uid,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            setFormData({ title: '', description: '', status: 'planning', team: [] });
            setIsModalOpen(false);
            setEditingProject(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        try {
            await remove(ref(database, `projects/${id}`));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleTeamMember = (uid) => {
        setFormData((prev) => ({
            ...prev,
            team: prev.team.includes(uid)
                ? prev.team.filter((id) => id !== uid)
                : [...prev.team, uid]
        }));
    };

    const markAsComplete = async (project) => {
        if (project.status === 'completed') return;
        try {
            await update(ref(database, `projects/${project.id}`), {
                ...project,
                status: 'completed',
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Team Board</h1>
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                    New Project
                </Button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {columns.map((col) => (
                    <div key={col.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
                            <h3 className="font-semibold text-gray-900">{col.title}</h3>
                            <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                {projects.filter((p) => p.status === col.id).length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {projects
                                .filter((p) => p.status === col.id)
                                .map((project) => (
                                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900">{project.title}</h4>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingProject(project);
                                                        setFormData(project);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <Edit2 size={14} className="text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="p-1 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={14} className="text-red-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2">{project.description}</p>

                                        {/* Info Section */}
                                        <div className="mb-2 text-xs text-gray-500">
                                            Assigned: {project.team.length} member
                                            {project.team.length > 1 ? 's' : ''} |
                                            Status: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Users size={14} className="text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                {project.team.length} members
                                            </span>
                                        </div>

                                        {/* Complete Button */}
                                        {project.status !== 'completed' && (
                                            <Button
                                                variant="success"
                                                className="mt-3 w-full flex items-center justify-center gap-2"
                                                onClick={() => markAsComplete(project)}
                                            >
                                                <Check size={16} /> Mark as Complete
                                            </Button>
                                        )}
                                    </Card>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Create/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
                }}
                title={editingProject ? 'Edit Project' : 'New Project'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {columns.map((col) => (
                                <option key={col.id} value={col.id}>{col.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {employees.map((emp) => (
                                <button
                                    key={emp.uid}
                                    type="button"
                                    onClick={() => toggleTeamMember(emp.uid)}
                                    className={`px-3 py-1 rounded-full border flex items-center gap-1 transition ${formData.team.includes(emp.uid)
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300'
                                        }`}
                                >
                                    {emp.displayName}
                                    {formData.team.includes(emp.uid) && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            className="mt-1"
                            onClick={() => alert('Team selection done!')}
                        >
                            Done
                        </Button>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" variant="primary" className="flex-1">
                            {editingProject ? 'Update' : 'Create'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingProject(null);
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

export default TeamBoard;
