import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Uncomment when Firebase Storage is enabled
// import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAc4uAQLDst9dhcfafjIgMp_BxF4m7zx6Y",
    authDomain: "couple-ai-a6035.firebaseapp.com",
    projectId: "couple-ai-a6035",
    storageBucket: "couple-ai-a6035.firebasestorage.app",
    messagingSenderId: "716765778164",
    appId: "1:716765778164:web:0743d55fc65ab91b838ea1",
    measurementId: "G-S0F37G3TQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
// Uncomment when Firebase Storage is enabled
// export const storage = getStorage(app);

export default app;
