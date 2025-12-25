// src/pages/dashboard/TimeTracker.jsx

import React, { useState, useEffect } from "react";
import { auth, database } from "../../firebase/config.js";  // 🔥 এখানে ../../ এবং .js যোগ করেছি
import { ref, set, onValue } from "firebase/database";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

const TimeTracker = () => {
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [hours, setHours] = useState("");
    const [editLogId, setEditLogId] = useState(null);
    const [editHours, setEditHours] = useState("");
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                loadData(user.uid);
            } else {
                try {
                    const result = await signInAnonymously(auth);
                    setUserId(result.user.uid);
                    loadData(result.user.uid);
                } catch (error) {
                    console.error("Auth error:", error);
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const loadData = (uid) => {
        const tasksRef = ref(database, `timeTracking/${uid}/tasks`);
        const logsRef = ref(database, `timeTracking/${uid}/logs`);

        onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setTasks(Object.values(data));
            } else {
                const defaultTasks = [
                    { id: 1, name: "Develop Dashboard UI", done: false },
                    { id: 2, name: "Fix Login Bug", done: false },
                    { id: 3, name: "Design New Page", done: false },
                ];
                setTasks(defaultTasks);
                const tasksObj = defaultTasks.reduce((acc, task) => {
                    acc[task.id] = task;
                    return acc;
                }, {});
                set(tasksRef, tasksObj);
            }
        });

        onValue(logsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLogs(Object.values(data));
            } else {
                setLogs([]);
            }
            setLoading(false);
        });
    };

    const saveTasks = (newTasks) => {
        if (!userId) return;
        const tasksRef = ref(database, `timeTracking/${userId}/tasks`);
        const tasksObj = newTasks.reduce((acc, task) => {
            acc[task.id] = task;
            return acc;
        }, {});
        set(tasksRef, tasksObj);
    };

    const saveLogs = (newLogs) => {
        if (!userId) return;
        const logsRef = ref(database, `timeTracking/${userId}/logs`);
        const logsObj = newLogs.reduce((acc, log) => {
            acc[log.id] = log;
            return acc;
        }, {});
        set(logsRef, logsObj);
    };

    useEffect(() => {
        if (!loading && userId && tasks.length > 0) {
            saveTasks(tasks);
        }
    }, [tasks]);

    useEffect(() => {
        if (!loading && userId) {
            saveLogs(logs);
        }
    }, [logs]);

    const addTask = () => {
        if (!newTask.trim()) return;
        const newT = { id: Date.now(), name: newTask, done: false };
        setTasks([...tasks, newT]);
        setNewTask("");
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter((t) => t.id !== id));
    };

    const toggleTaskDone = (id) => {
        setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    };

    const logTime = (task) => {
        if (!hours) return;
        const newLog = {
            id: Date.now(),
            task: task.name,
            hours,
            date: new Date().toLocaleString(),
            done: false,
        };
        setLogs([...logs, newLog]);
        setHours("");
    };

    const deleteLog = (id) => {
        setLogs(logs.filter((l) => l.id !== id));
    };

    const toggleLogDone = (id) => {
        setLogs(logs.map((l) => (l.id === id ? { ...l, done: !l.done } : l)));
    };

    const startEditLog = (log) => {
        setEditLogId(log.id);
        setEditHours(log.hours);
    };

    const saveEditLog = (id) => {
        setLogs(logs.map((l) => (l.id === id ? { ...l, hours: editHours } : l)));
        setEditLogId(null);
        setEditHours("");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-2xl font-bold text-indigo-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-10">
            <h1 className="text-5xl font-extrabold mb-4">⏱ Time Tracker</h1>
            <p className="text-gray-600 mb-8 text-lg">
                Track tasks, log time & manage productivity
            </p>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 flex gap-4">
                <input
                    type="text"
                    placeholder="New Task Name"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={addTask}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700"
                >
                    + Add Task
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-14">
                {tasks.map((task) => (
                    <div key={task.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl">
                        <div className="flex justify-between mb-4">
                            <h2 className={`text-2xl font-semibold ${task.done && "line-through text-gray-400"}`}>
                                {task.name}
                            </h2>
                            <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 text-sm">
                                Delete
                            </button>
                        </div>

                        <div className="flex gap-3 mb-4">
                            <input
                                type="number"
                                placeholder="Hours"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                className="w-24 border rounded-lg px-3 py-2"
                            />
                            <button
                                onClick={() => logTime(task)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                Log Time
                            </button>
                        </div>

                        <button
                            onClick={() => toggleTaskDone(task.id)}
                            className={`px-4 py-2 rounded-lg text-sm ${task.done ? "bg-gray-300 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                        >
                            {task.done ? "Undone" : "Done"}
                        </button>
                    </div>
                ))}
            </div>

            <h2 className="text-4xl font-bold mb-6">📊 Time Logs</h2>

            <div className="bg-white rounded-2xl shadow-lg p-6 max-h-96 overflow-y-auto space-y-4">
                {logs.length === 0 && <p className="text-gray-500">No logs yet.</p>}

                {logs.map((log) => (
                    <div key={log.id} className="border rounded-xl p-4 flex justify-between items-center hover:shadow">
                        <div>
                            <h3 className={`text-xl font-semibold ${log.done && "line-through text-gray-400"}`}>
                                {log.task}
                            </h3>
                            <p className="text-sm text-gray-500">{log.date}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {editLogId === log.id ? (
                                <>
                                    <input
                                        type="number"
                                        value={editHours}
                                        onChange={(e) => setEditHours(e.target.value)}
                                        className="w-20 border rounded px-2 py-1"
                                    />
                                    <button onClick={() => saveEditLog(log.id)} className="text-green-600 text-sm">
                                        Save
                                    </button>
                                </>
                            ) : (
                                <span className="text-2xl font-bold text-indigo-600">{log.hours}h</span>
                            )}

                            <button onClick={() => toggleLogDone(log.id)} className="text-blue-600 text-sm">
                                {log.done ? "Undone" : "Done"}
                            </button>

                            <button onClick={() => startEditLog(log)} className="text-yellow-500 text-sm">
                                Edit
                            </button>

                            <button onClick={() => deleteLog(log.id)} className="text-red-500 text-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimeTracker;