import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { database } from '../../firebase/config';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Flag,
    Trash2,
    Edit2,
    CheckCircle,
    Circle,
    Clock
} from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';

const MyTasks = () => {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: ''
    });

    // Fetch tasks from Firebase
    useEffect(() => {
        if (!currentUser) return;

        const tasksRef = ref(database, 'tasks');
        const unsubscribe = onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const tasksList = Object.entries(data)
                    .filter(([_, task]) => task.userId === currentUser.uid)
                    .map(([id, task]) => ({ id, ...task }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setTasks(tasksList);
                setFilteredTasks(tasksList);
            } else {
                setTasks([]);
                setFilteredTasks([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Filter tasks
    useEffect(() => {
        let filtered = [...tasks];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(task => task.status === filterStatus);
        }

        // Priority filter
        if (filterPriority !== 'all') {
            filtered = filtered.filter(task => task.priority === filterPriority);
        }

        setFilteredTasks(filtered);
    }, [searchQuery, filterStatus, filterPriority, tasks]);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingTask) {
                // Update existing task
                const taskRef = ref(database, `tasks/${editingTask.id}`);
                await update(taskRef, {
                    ...formData,
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Create new task
                const tasksRef = ref(database, 'tasks');
                const newTaskRef = push(tasksRef);
                await set(newTaskRef, {
                    ...formData,
                    userId: currentUser.uid,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                status: 'todo',
                dueDate: ''
            });
            setIsModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task. Please try again.');
        }
    };

    // Delete task
    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const taskRef = ref(database, `tasks/${taskId}`);
            await remove(taskRef);
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task. Please try again.');
        }
    };

    // Edit task
    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate || ''
        });
        setIsModalOpen(true);
    };

    // Toggle task status
    const toggleTaskStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
        try {
            const taskRef = ref(database, `tasks/${task.id}`);
            await update(taskRef, {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'in-progress':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'todo':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'medium':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'low':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        todo: tasks.filter(t => t.status === 'todo').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                    <p className="text-gray-600 mt-1">Manage and track your daily tasks</p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => {
                        setEditingTask(null);
                        setFormData({
                            title: '',
                            description: '',
                            priority: 'medium',
                            status: 'todo',
                            dueDate: ''
                        });
                        setIsModalOpen(true);
                    }}
                >
                    New Task
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total Tasks</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{taskStats.total}</p>
                        </div>
                        <CheckCircle className="text-blue-600" size={32} />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Completed</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">{taskStats.completed}</p>
                        </div>
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-700 font-medium">In Progress</p>
                            <p className="text-3xl font-bold text-orange-900 mt-1">{taskStats.inProgress}</p>
                        </div>
                        <Clock className="text-orange-600" size={32} />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700 font-medium">To Do</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{taskStats.todo}</p>
                        </div>
                        <Circle className="text-gray-600" size={32} />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="flex items-center gap-2">
                        <Flag size={20} className="text-gray-400" />
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Priority</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Tasks List */}
            <Card>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first task to get started'}
                        </p>
                        {!searchQuery && filterStatus === 'all' && filterPriority === 'all' && (
                            <Button
                                variant="primary"
                                icon={Plus}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Create Task
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleTaskStatus(task)}
                                    className="mt-1"
                                >
                                    {task.status === 'completed' ? (
                                        <CheckCircle className="text-green-600" size={24} />
                                    ) : (
                                        <Circle className="text-gray-400 hover:text-blue-600" size={24} />
                                    )}
                                </button>

                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2 mb-2">
                                        <h3
                                            className={`text-lg font-semibold ${task.status === 'completed'
                                                    ? 'line-through text-gray-500'
                                                    : 'text-gray-900'
                                                }`}
                                        >
                                            {task.title}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-3">{task.description}</p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        {task.dueDate && (
                                            <div className="flex items-center gap-1">
                                                <Calendar size={16} />
                                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} />
                                            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(task)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Task Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                }}
                title={editingTask ? 'Edit Task' : 'Create New Task'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Enter task description"
                            rows="3"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" variant="primary" className="flex-1">
                            {editingTask ? 'Update Task' : 'Create Task'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingTask(null);
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

export default MyTasks;