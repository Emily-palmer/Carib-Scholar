

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-functions.js";

// !!! IMPORTANT: Replace this with your actual Firebase config !!!
const firebaseConfig = {
     apiKey: "AIzaSyDu8Oj_4ivlDO0IhfBx4zVuqsu5KJ6LQxg",
  authDomain: "carib-scholar22.firebaseapp.com",
  projectId: "carib-scholar22",
  storageBucket: "carib-scholar22.firebasestorage.app",
  messagingSenderId: "280812363567",
  appId: "1:280812363567:web:9ecf0327a4377ffa57cbda",
  measurementId: "G-T7LHPS57MT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);

const googleProvider = new GoogleAuthProvider();

export { auth, db, functions, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, doc, getDoc, setDoc, httpsCallable, googleProvider, signInWithPopup };