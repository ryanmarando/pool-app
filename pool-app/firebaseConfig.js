// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlTelzP2AlMephGGLm4BEWgInbEwlkrBM",
  authDomain: "pool-places-app.firebaseapp.com",
  projectId: "pool-places-app",
  storageBucket: "pool-places-app.appspot.com",
  messagingSenderId: "57883574362",
  appId: "1:57883574362:web:4e4986befc951bf077d863",
  measurementId: "G-0KPMEZ1JPE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
