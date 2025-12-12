import { ref, computed } from 'vue';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    orderBy,
    Timestamp,
    onSnapshot
} from 'firebase/firestore';
// Firebase Storage is optional - uncomment if you enable it in Firebase Console
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
// import { storage } from '../firebase';

const coupleData = ref(null);
const events = ref([]);
const loading = ref(false);

export function useCoupleData() {
    // Get or create couple data
    const getCoupleData = async (userId) => {
        try {
            loading.value = true;

            // First, try to find existing couple data where user is a partner
            const couplesRef = collection(db, 'couples');
            const q = query(
                couplesRef,
                where('userId1', '==', userId)
            );
            const q2 = query(
                couplesRef,
                where('userId2', '==', userId)
            );

            const snapshot1 = await getDocs(q);
            const snapshot2 = await getDocs(q2);

            if (!snapshot1.empty) {
                const docData = snapshot1.docs[0];
                coupleData.value = { id: docData.id, ...docData.data() };
            } else if (!snapshot2.empty) {
                const docData = snapshot2.docs[0];
                coupleData.value = { id: docData.id, ...docData.data() };
            } else {
                // Create new couple data
                coupleData.value = null;
            }

            return coupleData.value;
        } catch (error) {
            console.error('Error getting couple data:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Create couple profile
    const createCoupleProfile = async (userId, data) => {
        try {
            loading.value = true;
            const coupleRef = doc(collection(db, 'couples'));

            const coupleDoc = {
                userId1: userId,
                userId2: data.userId2 || '',
                partner1Name: data.partner1Name,
                partner2Name: data.partner2Name,
                partner1Photo: data.partner1Photo || '',
                partner2Photo: data.partner2Photo || '',
                firstDayTogether: Timestamp.fromDate(new Date(data.firstDayTogether)),
                createdAt: Timestamp.now()
            };

            await setDoc(coupleRef, coupleDoc);
            coupleData.value = { id: coupleRef.id, ...coupleDoc };

            return coupleData.value;
        } catch (error) {
            console.error('Error creating couple profile:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Update couple profile
    const updateCoupleProfile = async (coupleId, data) => {
        try {
            loading.value = true;
            const coupleRef = doc(db, 'couples', coupleId);
            await updateDoc(coupleRef, data);

            // Update local data
            coupleData.value = { ...coupleData.value, ...data };

            return coupleData.value;
        } catch (error) {
            console.error('Error updating couple profile:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Upload profile picture (DISABLED - Enable Firebase Storage first)
    const uploadProfilePicture = async (file, partnerId) => {
        // Uncomment below when Firebase Storage is enabled
        /*
        try {
            loading.value = true;
            const fileRef = storageRef(storage, `profile-pictures/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            return url;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw error;
        } finally {
            loading.value = false;
        }
        */
        alert('Profile picture upload is disabled. Enable Firebase Storage to use this feature (it\'s free!)');
        return '';
    };

    // Get events for couple
    const getEvents = async (coupleId) => {
        try {
            loading.value = true;
            const eventsRef = collection(db, 'events');
            const q = query(
                eventsRef,
                where('coupleId', '==', coupleId),
                orderBy('date', 'asc')
            );

            const snapshot = await getDocs(q);
            events.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return events.value;
        } catch (error) {
            console.error('Error getting events:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Add event
    const addEvent = async (coupleId, eventData) => {
        try {
            loading.value = true;
            console.log('🔵 Adding event with coupleId:', coupleId);
            console.log('🔵 Event data:', eventData);

            const eventsRef = collection(db, 'events');

            const eventDoc = {
                coupleId,
                title: eventData.title,
                date: Timestamp.fromDate(new Date(eventData.date)),
                type: eventData.type,
                description: eventData.description || '',
                createdAt: Timestamp.now()
            };

            console.log('🔵 Event document to save:', eventDoc);
            const docRef = await addDoc(eventsRef, eventDoc);
            console.log('✅ Event saved successfully with ID:', docRef.id);

            const newEvent = { id: docRef.id, ...eventDoc };
            events.value.push(newEvent);

            // Sort events by date
            events.value.sort((a, b) => a.date.toMillis() - b.date.toMillis());

            return newEvent;
        } catch (error) {
            console.error('❌ Error adding event:', error);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error message:', error.message);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Delete event
    const deleteEvent = async (eventId) => {
        try {
            loading.value = true;
            await deleteDoc(doc(db, 'events', eventId));
            events.value = events.value.filter(e => e.id !== eventId);
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Calculate days together
    const daysTogetherCount = computed(() => {
        if (!coupleData.value?.firstDayTogether) return 0;

        const firstDay = coupleData.value.firstDayTogether.toDate();
        const today = new Date();
        const diffTime = Math.abs(today - firstDay);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    });

    // Real-time sync for couple data
    const subscribeToCoupleData = (coupleId, callback) => {
        const coupleRef = doc(db, 'couples', coupleId);
        return onSnapshot(coupleRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = { id: snapshot.id, ...snapshot.data() };
                coupleData.value = data;
                if (callback) callback(data);
            }
        }, (error) => {
            console.error('Error in couple data subscription:', error);
        });
    };

    // Real-time sync for events
    const subscribeToEvents = (coupleId, callback) => {
        console.log('🔵 Setting up real-time listener for coupleId:', coupleId);

        const eventsRef = collection(db, 'events');
        const q = query(
            eventsRef,
            where('coupleId', '==', coupleId),
            orderBy('date', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            console.log('🔵 Events snapshot received, count:', snapshot.docs.length);

            events.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log('✅ Events loaded:', events.value.length, 'events');
            events.value.forEach(event => {
                console.log('  - Event:', event.title, 'Date:', event.date.toDate());
            });

            if (callback) callback(events.value);
        }, (error) => {
            console.error('❌ Error in events subscription:', error);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error message:', error.message);
        });
    };

    return {
        coupleData,
        events,
        loading,
        daysTogetherCount,
        getCoupleData,
        createCoupleProfile,
        updateCoupleProfile,
        uploadProfilePicture,
        getEvents,
        addEvent,
        deleteEvent,
        subscribeToCoupleData,
        subscribeToEvents
    };
}
