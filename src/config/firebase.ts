import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
    apiKey: "AIzaSyDlmVY-O3IKNiwerQC-T57_nwmuTMgxa6M",
    authDomain: "base-template-294a9.firebaseapp.com",
    projectId: "base-template-294a9",
    storageBucket: "base-template-294a9.firebasestorage.app",
    messagingSenderId: "1053283093512",
    appId: "1:1053283093512:web:6a368a3b6057a1869b55bd"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
