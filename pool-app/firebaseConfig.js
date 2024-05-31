// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { app, auth };
