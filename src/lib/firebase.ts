// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBroPCNks5fvkDQopAVp1S5mlVw48Ro-0U",
  authDomain: "yunai-missioncontrol.firebaseapp.com",
  projectId: "yunai-missioncontrol",
  storageBucket: "yunai-missioncontrol.firebasestorage.app",
  messagingSenderId: "349121157859",
  appId: "1:349121157859:web:2bed4d34ba41cbe64e43d6"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
