// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: replace with your own Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAS0otiSNpnEG1LsPteYemJNkO6zE0oIYc",
  authDomain: "to-do-2d20c.firebaseapp.com",
  projectId: "to-do-2d20c",
  storageBucket: "to-do-2d20c.firebasestorage.app",
  messagingSenderId: "398380690182",
  appId: "1:398380690182:web:ae8534a7f4ccdda2470c87",
  measurementId: "G-GPWEHQKLDB",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
