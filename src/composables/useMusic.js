import { ref } from 'vue';
import { storage, db } from '../firebase';
import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';

export function useMusic() {
    const uploading = ref(false);
    const error = ref(null);

    // Upload music file
    const uploadMusic = async (file, coupleId, userId) => {
        if (!file || !coupleId) return null;

        uploading.value = true;
        error.value = null;

        try {
            // 1. Upload to Storage
            const fileRef = storageRef(storage, `music/${coupleId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const url = await getDownloadURL(snapshot.ref);

            // 2. Add to Firestore subcollection
            const musicRef = collection(db, 'couples', coupleId, 'music');
            await addDoc(musicRef, {
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                url,
                fileName: file.name,
                storagePath: snapshot.ref.fullPath,
                uploadedBy: userId,
                createdAt: serverTimestamp()
            });

            return url;
        } catch (err) {
            console.error('Error uploading music:', err);
            error.value = err.message;
            throw err;
        } finally {
            uploading.value = false;
        }
    };

    // Get real-time music list
    const getMusicList = (coupleId, callback) => {
        if (!coupleId) return () => { };

        const musicRef = collection(db, 'couples', coupleId, 'music');
        const q = query(musicRef, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const musicList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(musicList);
        });
    };

    // Set Background Music for the couple
    const setCoupleBGM = async (coupleId, music) => {
        if (!coupleId || !music) return;

        const coupleRef = doc(db, 'couples', coupleId);
        await updateDoc(coupleRef, {
            bgmUrl: music.url,
            bgmTitle: music.title
        });
    };

    // Delete music
    const deleteMusic = async (coupleId, musicId, storagePath) => {
        try {
            // 1. Delete from Storage
            if (storagePath) {
                const fileRef = storageRef(storage, storagePath);
                await deleteObject(fileRef);
            }

            // 2. Delete from Firestore
            const docRef = doc(db, 'couples', coupleId, 'music', musicId);
            await deleteDoc(docRef);
        } catch (err) {
            console.error('Error deleting music:', err);
            throw err;
        }
    };

    return {
        uploading,
        error,
        uploadMusic,
        getMusicList,
        setCoupleBGM,
        deleteMusic
    };
}
