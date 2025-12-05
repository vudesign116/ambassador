// Firebase Configuration - PRODUCTION VERSION
// Replace with your actual Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                    // ← Thay từ Firebase Console
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",              // ← Thay bằng project ID của bạn
  storageBucket: "YOUR_PROJECT_ID.appspot.com",  // ← Có sẵn, nhưng survey system KHÔNG dùng
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Database để lưu surveys)
export const db = getFirestore(app);

// Note: storageBucket có trong config nhưng KHÔNG cần enable
// Chỉ cần enable khi muốn upload files

export default firebaseConfig;
