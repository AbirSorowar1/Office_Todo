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
    const [loading, setLoading] = useState(true);
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
            setCurrentUser(user || null); // ensure null if logged out
            setLoading(false);
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

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
