import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Reemplaza estos valores con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTk3sv9Ie4omeS9rDhCHI8S29MY749BPI",
  authDomain: "bettracker-760da.firebaseapp.com",
  projectId: "bettracker-760da",
  storageBucket: "bettracker-760da.firebasestorage.app",
  messagingSenderId: "454886942418",
  appId: "1:454886942418:web:bd6704859dbf2d91cbaf0b",
  measurementId: "G-MPGD1Q9PZG",
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
