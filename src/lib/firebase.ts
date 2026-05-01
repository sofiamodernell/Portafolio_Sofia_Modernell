import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0258265320",
  appId: "1:1044416976061:web:d41a36f4598852849d93d4",
  apiKey: "AIzaSyBQYiZX1XkykWB8hZM-25HEHOHNHL_sH6Q",
  authDomain: "gen-lang-client-0258265320.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-4acde88a-9fff-4470-8c72-05b6644296d6",
  storageBucket: "gen-lang-client-0258265320.firebasestorage.app",
  messagingSenderId: "1044416976061",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();
