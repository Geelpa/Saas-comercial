import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDplzzekFHMSryxiky_RnC6zC3e-bLijrg",
    authDomain: "comercial-9a919.firebaseapp.com",
    projectId: "comercial-9a919",
    storageBucket: "comercial-9a919.firebasestorage.app",
    messagingSenderId: "3678658739",
    appId: "1:3678658739:web:2e974aa564211a9ab4d0c6"
};

// Inicializa o Firebase App
const app = initializeApp(firebaseConfig);

// Cria a instância do Firestore e exporta
const db = getFirestore(app);
export { db }
console.log("🔥 Firestore conectado:", db);