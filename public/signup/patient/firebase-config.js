// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCU_XqW-FuNivXUYuDHY8fG2-FFxP_yUb4",
    authDomain: "smart-diet-5706d.firebaseapp.com",
    databaseURL: "https://smart-diet-5706d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-diet-5706d",
    storageBucket: "smart-diet-5706d.firebasestorage.app",
    messagingSenderId: "659505981433",
    appId: "1:659505981433:web:95fc252458e5a4e1ee7f28",
    measurementId: "G-QFXFE3YF0R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);