// src/firebase.js
// Firebase v9 (modular) — paste this exact file into src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

/*
  IMPORTANT:
  Replace the firebaseConfig values below with the config from
  Firebase Console -> Project settings -> Your apps -> Firebase SDK snippet (config)
*/
const firebaseConfig = {
  apiKey: "AIzaSyAS0otiSNpnEG1LsPteYemJNkO6zE0oIYc",
  authDomain: "to-do-2d20c.firebaseapp.com",
  projectId: "to-do-2d20c",
  storageBucket: "to-do-2d20c.firebasestorage.app",
  messagingSenderId: "398380690182",
  appId: "1:398380690182:web:ae8534a7f4ccdda2470c87",
  measurementId: "G-GPWEHQKLDB"
};

// initialize app (only once)
const app = initializeApp(firebaseConfig);

// exports useful instances
export const db = getFirestore(app);
export const auth = getAuth(app);

// Optional: enable offline persistence (ignore if it throws)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    // Common: failed if multiple tabs open or browser not supported
    console.warn("IndexedDB persistence not enabled:", err?.message ?? err);
  });
} catch (e) {
  console.warn("Failed to enable persistence:", e?.message ?? e);
}

/** -----------------------
 * Authentication helpers
 * ----------------------- */

/**
 * Ensure anonymous auth. Safe to call repeatedly.
 * Throws on failure.
 */
export async function ensureAnonymousAuth() {
  try {
    // if there's already a signed-in user, do nothing
    if (auth.currentUser) {
      console.log("Already signed in:", auth.currentUser.uid);
      return auth.currentUser;
    }
    const cred = await signInAnonymously(auth);
    console.log("Anonymous sign-in OK:", cred.user.uid);
    return cred.user;
  } catch (err) {
    console.error("Anonymous sign-in failed:", err);
    throw err;
  }
}

/** -----------------------
 * Firestore helpers
 * ----------------------- */

const TODOS_COLLECTION = "todos";

/**
 * Subscribe (realtime) to todos collection.
 * callback receives an array of docs: [{ id, ...data }, ...]
 * Returns the unsubscribe function.
 */
export function subscribeTodos(callback) {
  const q = query(collection(db, TODOS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  }, (error) => {
    console.error("subscribeTodos error:", error);
    callback([]); // optionally signal empty
  });
}

/**
 * Add a todo - returns the docRef
 * todo should be an object like { text, completed, createdAt, ownerId? }
 */
export async function addTodoFirestore(todo) {
  if (!todo || typeof todo !== "object") {
    throw new Error("addTodoFirestore requires a todo object");
  }
  const colRef = collection(db, TODOS_COLLECTION);
  return await addDoc(colRef, todo);
}

/**
 * Update a todo doc by id
 * data is a partial object with fields to update
 */
export async function updateTodoFirestore(id, data) {
  if (!id) throw new Error("updateTodoFirestore requires id");
  return await updateDoc(doc(db, TODOS_COLLECTION, id), data);
}

/**
 * Delete a todo document by id
 */
export async function deleteTodoFirestore(id) {
  if (!id) throw new Error("deleteTodoFirestore requires id");
  return await deleteDoc(doc(db, TODOS_COLLECTION, id));
}
