import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, database } from '../firebase/config';
import { ref, set, get } from 'firebase/database';

// Create Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);  // This is crucial for initial auth check
    const [error, setError] = useState(null);

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Save user data to Realtime Database
            const userRef = ref(database, `users/${user.uid}`);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                // New user - create profile
                await set(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    department: 'General',
                    role: 'Employee',
                    joinedAt: new Date().toISOString(),
                    leaveBalance: 20,
                    status: 'active'
                });
            } else {
                // Optional: update existing user info
                await set(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    department: snapshot.val().department || 'General',
                    role: snapshot.val().role || 'Employee',
                    joinedAt: snapshot.val().joinedAt,
                    leaveBalance: snapshot.val().leaveBalance || 20,
                    status: snapshot.val().status || 'active'
                });
            }

            return result;
        } catch (err) {
            setError(err.message);
            console.error('Sign in error:', err);
            throw err;
        }
    };

    // Sign out
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err) {
            setError(err.message);
            console.error('Logout error:', err);
            throw err;
        }
    };

    // Monitor auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user || null);
            setLoading(false);  // Loading ends here — very important
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        error,
        signInWithGoogle,
        logout
    };

    // Critical fix: Only render children when initial loading is complete
    // This prevents routes from redirecting to login during the brief moment when currentUser is still null
    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                // Simple full-screen loader while Firebase checks auth state
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};