//   <script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAo0U5rtXvJN25m71s3rxvpDhFy5Uyn75U",
    authDomain: "uplay-auth.firebaseapp.com",
    projectId: "uplay-auth",
    storageBucket: "uplay-auth.firebasestorage.app",
    messagingSenderId: "93490920321",
    appId: "1:93490920321:web:9ae1312634d4bfca20c680"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check auth state
onAuthStateChanged(auth, async (user) => {
    if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        document.getElementById("username").textContent = userSnap.data().username;
        document.getElementById("email").textContent = userSnap.data().email;
    } else {
        document.getElementById("username").textContent = "(No username found)";
    }
    } else {
    window.location = "login.html"; // redirect if not logged in
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location = "login.html";
});