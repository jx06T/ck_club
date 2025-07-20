import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAlHE4DzllQhS3nKQbSUO9vV_dIpFAG_l4",
    authDomain: "ck-club.firebaseapp.com",
    projectId: "ck-club",
    storageBucket: "ck-club.firebasestorage.app",
    messagingSenderId: "1080673921130",
    appId: "1:1080673921130:web:3249824e83147538d88213",
    measurementId: "G-BDWYT08WVF"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);