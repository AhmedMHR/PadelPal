import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// 🟢 Hardcoded Config
const firebaseConfig = {
  apiKey: "AIzaSyCIJ9m5mzTBvl6wM1KBnQA3xLAQ7AVyKEc",
  authDomain: "test-action-a9c21.firebaseapp.com",
  projectId: "test-action-a9c21",
  storageBucket: "test-action-a9c21.firebasestorage.app",
  messagingSenderId: "795377092285",
  appId: "1:795377092285:web:3f10e3e366d2f0634519d4",
  databaseURL: "https://test-action-a9c21.firebaseio.com"
};

// Initialize App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🟢 FIX: Force Long Polling to avoid "Client Offline" errors
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // <--- THE MAGIC FIX
  localCache: { 
    kind: 'persistent',
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  } 
});

const auth = getAuth(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app); 

export { app, auth, db, storage, realtimeDb };