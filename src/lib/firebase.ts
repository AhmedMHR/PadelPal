import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCIJ9m5mzTBvl6wM1KBnQA3xLAQ7AVyKEc",
  authDomain: "test-action-a9c21.firebaseapp.com",
  projectId: "test-action-a9c21",
  storageBucket: "test-action-a9c21.appspot.com",
  messagingSenderId: "795377092285",
  appId: "1:795377092285:web:3f10e3e366d2f0634519d4",
  databaseURL: "https://test-action-a9c21.firebaseio.com"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const auth = getAuth(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app);

export { app, auth, db, storage, realtimeDb };