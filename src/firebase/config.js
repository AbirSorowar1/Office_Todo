// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD9QqtLUH910GITHZPLWA7FDzXEm-OXv9I",
    authDomain: "janina-bf7e5.firebaseapp.com",
    databaseURL: "https://janina-bf7e5-default-rtdb.firebaseio.com",
    projectId: "janina-bf7e5",
    storageBucket: "janina-bf7e5.appspot.com",
    messagingSenderId: "219833641066",
    appId: "1:219833641066:web:189f75d9e39340dff5c213"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app;