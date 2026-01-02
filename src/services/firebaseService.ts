import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp,
    onSnapshot,
    type QueryConstraint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Generic CRUD operations
export const firebaseService = {
    // Create
    async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return docRef.id;
    },

    // Read one
    async getById<T>(collectionName: string, id: string): Promise<T | null> {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
    },

    // Read all
    async getAll<T>(collectionName: string, ...queryConstraints: QueryConstraint[]): Promise<T[]> {
        const q = query(collection(db, collectionName), ...queryConstraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as T[];
    },

    // Update
    async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now(),
        });
    },

    // Delete
    async delete(collectionName: string, id: string): Promise<void> {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
    },

    // Real-time subscription
    subscribe<T>(
        collectionName: string,
        callback: (data: T[]) => void,
        ...queryConstraints: QueryConstraint[]
    ): () => void {
        console.log(`🔥 FirebaseService: Subscribing to collection '${collectionName}'`);
        const q = query(collection(db, collectionName), ...queryConstraints);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            console.log(`🔥 FirebaseService: Snapshot received for '${collectionName}', docs count:`, querySnapshot.docs.length);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as T[];
            console.log(`🔥 FirebaseService: Calling callback with data:`, data);
            callback(data);
        }, (error) => {
            console.error(`🔥 FirebaseService: Error in subscription for '${collectionName}':`, error);
        });

        return unsubscribe;
    },

    // File upload
    async uploadFile(path: string, file: File): Promise<string> {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    },


    // File delete
    async deleteFile(path: string): Promise<void> {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    },

    // Invitation-specific methods
    async createInvitation(data: any): Promise<string> {
        const docRef = await addDoc(collection(db, 'invitations'), {
            ...data,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    },

    async getInvitationByToken(token: string): Promise<any | null> {
        const q = query(collection(db, 'invitations'), where('token', '==', token));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    },

    async updateInvitationStatus(invitationId: string, status: string, usedAt?: Timestamp): Promise<void> {
        const docRef = doc(db, 'invitations', invitationId);
        const updateData: any = { status };
        if (usedAt) {
            updateData.usedAt = usedAt;
        }
        await updateDoc(docRef, updateData);
    },

    async getActiveInvitations(userId: string): Promise<any[]> {
        const q = query(
            collection(db, 'invitations'),
            where('createdBy', '==', userId)
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    },

    async revokeInvitation(invitationId: string): Promise<void> {
        const docRef = doc(db, 'invitations', invitationId);
        await updateDoc(docRef, {
            status: 'revoked',
        });
    },
};
