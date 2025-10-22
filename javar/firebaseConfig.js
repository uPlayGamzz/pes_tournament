// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAo0U5rtXvJN25m71s3rxvpDhFy5Uyn75U",
  authDomain: "uplay-auth.firebaseapp.com",
  projectId: "uplay-auth",
  storageBucket: "uplay-auth.firebasestorage.app",
  messagingSenderId: "93490920321",
  appId: "1:93490920321:web:9ae1312634d4bfca20c680"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

