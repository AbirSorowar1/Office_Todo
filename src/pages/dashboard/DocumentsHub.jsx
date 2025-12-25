// src/pages/dashboard/DocumentsHub.jsx

import React, { useState, useEffect } from "react";
import { database, storage } from "../../firebase/config.js"; // পাথ ঠিক করো
import { ref as dbRef, onValue, push, set } from "firebase/database";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FileText, Image, File, Plus, Calendar, Download, Upload, X } from "lucide-react";

const DocumentsHub = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [newDoc, setNewDoc] = useState({ title: "", file: null, date: "" });

    useEffect(() => {
        const docsRef = dbRef(database, "documents");
        const unsubscribe = onValue(docsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const docsList = Object.entries(data).map(([id, doc]) => ({
                    id,
                    ...doc,
                }));
                docsList.sort((a, b) => new Date(b.date) - new Date(a.date));
                setDocuments(docsList);
            } else {
                setDocuments([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setNewDoc({ ...newDoc, file: e.target.files[0] });
        }
    };

    const uploadDocument = () => {
        if (!newDoc.title.trim() || !newDoc.file || !newDoc.date) {
            alert("সব ফিল্ড পূরণ করো!");
            return;
        }

        setUploading(true);
        const fileRef = storageRef(storage, `documents/${Date.now()}_${newDoc.file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, newDoc.file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(prog);
            },
            (error) => {
                console.error(error);
                alert("আপলোডে সমস্যা হয়েছে!");
                setUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const docsRef = dbRef(database, "documents");
                    const newDocRef = push(docsRef);

                    const fileType = newDoc.file.type.includes("pdf")
                        ? "PDF"
                        : newDoc.file.type.includes("image")
                            ? newDoc.file.name.split(".").pop().toUpperCase()
                            : "DOCX";

                    set(newDocRef, {
                        title: newDoc.title.trim(),
                        type: fileType,
                        date: newDoc.date,
                        url: downloadURL,
                        fileName: newDoc.file.name,
                    });

                    setNewDoc({ title: "", file: null, date: "" });
                    setShowAddForm(false);
                    setUploading(false);
                    setProgress(0);
                });
            }
        );
    };

    const getIcon = (type) => {
        switch (type.toUpperCase()) {
            case "PDF": return <FileText className="w-12 h-12 text-red-500" />;
            case "PNG": case "JPG": case "JPEG": return <Image className="w-12 h-12 text-blue-500" />;
            case "DOCX": case "DOC": return <File className="w-12 h-12 text-blue-700" />;
            default: return <File className="w-12 h-12 text-gray-500" />;
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-3xl font-bold text-purple-600 animate-pulse">Loading Documents...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                            Documents Hub
                        </h1>
                        <p className="text-xl text-gray-700">Upload & share files with your team</p>
                    </div>

                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="mt-6 md:mt-0 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition flex items-center gap-3"
                    >
                        <Plus size={24} />
                        Upload File
                    </button>
                </div>

                {showAddForm && (
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-10 border border-white/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Upload New File</h3>
                            <button onClick={() => setShowAddForm(false)}><X size={24} className="text-gray-500" /></button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <input
                                type="text"
                                placeholder="Title (e.g. Monthly Report December)"
                                value={newDoc.title}
                                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                                className="px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-300 outline-none text-lg"
                            />
                            <input type="date" value={newDoc.date} onChange={(e) => setNewDoc({ ...newDoc, date: e.target.value })} className="px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-300 outline-none text-lg" />

                            <label className="px-5 py-4 rounded-xl border-2 border-dashed border-purple-400 bg-purple-50 cursor-pointer flex items-center justify-center gap-3 hover:bg-purple-100 transition">
                                <Upload size={24} className="text-purple-600" />
                                <span className="text-lg text-purple-700">
                                    {newDoc.file ? newDoc.file.name : "Choose File (PDF, Image, DOCX)"}
                                </span>
                                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={handleFileChange} className="hidden" />
                            </label>

                            <div></div> {/* empty for grid */}
                        </div>

                        {uploading && (
                            <div className="mt-6">
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-center mt-2 text-purple-700 font-bold">{progress}% Uploaded</p>
                            </div>
                        )}

                        <div className="mt-8 flex gap-4 justify-end">
                            <button
                                onClick={uploadDocument}
                                disabled={uploading}
                                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50"
                            >
                                {uploading ? "Uploading..." : "Upload File"}
                            </button>
                        </div>
                    </div>
                )}

                {documents.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                            <File size={64} className="text-gray-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-600 mb-4">No documents yet</h3>
                        <p className="text-xl text-gray-500">Upload your first file!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {documents.map((doc) => (
                            <a
                                key={doc.id}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block bg-white/70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border border-white/50"
                            >
                                <div className="p-8 text-center">
                                    <div className="mb-6 flex justify-center">{getIcon(doc.type)}</div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{doc.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2 flex items-center justify-center gap-2">
                                        <Calendar size={16} /> {formatDate(doc.date)}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">{doc.fileName}</p>
                                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                                        {doc.type}
                                    </span>
                                </div>

                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-full py-3 bg-white text-purple-700 font-bold rounded-xl flex items-center justify-center gap-3">
                                        <Download size={20} />
                                        Open & Download
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsHub;