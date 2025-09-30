import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPJqAN4-m9GJiskryZkH5FD1Z79F04Z5Q",
  authDomain: "checkapp-47c6a.firebaseapp.com",
  projectId: "checkapp-47c6a",
  storageBucket: "checkapp-47c6a.firebasestorage.app",
  messagingSenderId: "1085283312323",
  appId: "1:1085283312323:web:29cd6c4d8f7a6f7ae73876",
  measurementId: "G-41QLZE94QF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;