import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { type User, UserRole, getPermissionsByRole } from '../types/user';
import { getFirebaseErrorMessage } from '../utils/errorMessages';

interface AuthContextType {
    currentUser: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Obtener datos del usuario desde Firestore
    const getUserData = async (uid: string): Promise<User | null> => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data() as User;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    // Crear usuario en Firestore
    const createUserInFirestore = async (
        uid: string,
        email: string,
        displayName: string
    ): Promise<User> => {
        const role = UserRole.ADMIN;
        const permissions = getPermissionsByRole(role);

        const newUser: User = {
            uid,
            email,
            displayName,
            role,
            permissions,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isActive: true,
        };

        await setDoc(doc(db, 'users', uid), newUser);
        return newUser;
    };

    // Login con email y contraseña
    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userData = await getUserData(userCredential.user.uid);

            if (!userData) {
                throw new Error('Usuario no encontrado en la base de datos');
            }

            if (!userData.isActive) {
                await signOut(auth);
                throw new Error('Usuario inactivo. Contacta al administrador.');
            }
        } catch (error: any) {
            throw new Error(getFirebaseErrorMessage(error.code) || error.message);
        }
    };

    // Login con Google
    const loginWithGoogle = async () => {
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            let userData = await getUserData(userCredential.user.uid);

            // Si el usuario no existe en Firestore, crearlo
            if (!userData) {
                userData = await createUserInFirestore(
                    userCredential.user.uid,
                    userCredential.user.email || '',
                    userCredential.user.displayName || 'Usuario'
                );
            }

            if (!userData.isActive) {
                await signOut(auth);
                throw new Error('Usuario inactivo. Contacta al administrador.');
            }
        } catch (error: any) {
            throw new Error(getFirebaseErrorMessage(error.code) || error.message);
        }
    };

    // Registro
    const register = async (email: string, password: string, displayName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserInFirestore(userCredential.user.uid, email, displayName);
    };

    // Logout
    const logout = async () => {
        await signOut(auth);
    };

    // Observer de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);

            if (user) {
                const userData = await getUserData(user.uid);
                setCurrentUser(userData);
            } else {
                setCurrentUser(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        firebaseUser,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
