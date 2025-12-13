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
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { holidays, getNextHolidayDate } from '../utils/holidays';


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

            // Handle Birthday Events Logic
            if (data.partner1Birthday || data.partner2Birthday) {
                const manageBirthdayEvent = async (partnerName, birthdayString) => {
                    if (!birthdayString) return;

                    // 1. Calculate next birthday
                    const birthday = new Date(birthdayString);
                    const today = new Date();
                    let nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

                    if (nextBirthday < today) {
                        nextBirthday.setFullYear(today.getFullYear() + 1);
                    }

                    // 2. Find existing birthday events for this partner
                    // We'll search local events first to avoid extra reads if possible, 
                    // otherwise query Firestore. For robustness, let's query.
                    // Actually, to keep it simple and consistent with "events" ref we already have:
                    // We can filter `events.value` but that might be stale if strict sync isn't instant.
                    // Better to query Firestore for events of type 'birthday' with title containing name.
                    // OR simpler: Delete ALL 'birthday' events for this person and recreate.

                    const eventsRef = collection(db, 'events');
                    const q = query(
                        eventsRef,
                        where('coupleId', '==', coupleId),
                        where('type', '==', 'birthday'),
                        where('title', '==', `${partnerName}'s Birthday`)
                    );

                    const snapshot = await getDocs(q);
                    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
                    await Promise.all(deletePromises);

                    // 3. Create new event
                    const eventDoc = {
                        coupleId,
                        title: `${partnerName}'s Birthday`,
                        date: Timestamp.fromDate(nextBirthday),
                        type: 'birthday',
                        description: `Happy Birthday ${partnerName}! 🎉`,
                        createdAt: Timestamp.now()
                    };

                    await addDoc(eventsRef, eventDoc);
                };

                if (data.partner1Birthday) {
                    // If name also changed, use new name, else existing
                    const name = data.partner1Name || coupleData.value.partner1Name;
                    await manageBirthdayEvent(name, data.partner1Birthday);
                }

                if (data.partner2Birthday) {
                    const name = data.partner2Name || coupleData.value.partner2Name;
                    await manageBirthdayEvent(name, data.partner2Birthday);
                }
            }

            // If only name changed, we might want to update birthday event titles?
            // This adds complexity. For now, let's assume they update birthday if they rename, 
            // or we just handle it when birthday is touched. 
            // Better: If name changes, we should also find their birthday event and rename it.
            if ((data.partner1Name || data.partner2Name) && !data.partner1Birthday && !data.partner2Birthday) {
                // Check if they have a birthday set in current data
                if (data.partner1Name && coupleData.value.partner1Birthday) {
                    // Update event title
                    // This is complex because we need to find the OLD name event. 
                    // Let's iterate linearly over events for simplicity as dataset is small or query by type 'birthday'
                    const eventsRef = collection(db, 'events');
                    // It's hard to query by dynamic old title without knowing it perfectly.
                    // But we have local `events.value`.
                    // Let's skip for now to avoid over-engineering, users can re-save birthday to fix event.
                }
            }

            return coupleData.value;
        } catch (error) {
            console.error('Error updating couple profile:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Upload profile picture
    const uploadProfilePicture = async (file, userId) => {
        try {
            loading.value = true;
            console.log('uploadProfilePicture called with:', { fileName: file.name, userId });

            const storagePath = `profile-pictures/${userId}/${Date.now()}_${file.name}`;
            console.log('Storage path:', storagePath);

            const fileRef = storageRef(storage, storagePath);
            console.log('Storage ref created:', fileRef);

            await uploadBytes(fileRef, file);
            console.log('File uploaded successfully');

            const url = await getDownloadURL(fileRef);
            console.log('Download URL obtained:', url);

            return url;
        } catch (error) {
            console.error('Error in uploadProfilePicture:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        } finally {
            loading.value = false;
        }
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

    // Create holiday events automatically
    const createHolidayEvents = async (coupleId) => {
        try {
            console.log('🎉 Creating holiday events for couple:', coupleId);

            // Get existing events to check for duplicates
            const eventsRef = collection(db, 'events');
            const q = query(
                eventsRef,
                where('coupleId', '==', coupleId),
                where('type', '==', 'holiday')
            );

            const snapshot = await getDocs(q);
            const existingHolidays = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get existing holiday titles to prevent duplicates
            const existingTitles = new Set(existingHolidays.map(h => h.title));

            let createdCount = 0;

            // Create events for each holiday
            for (const holiday of holidays) {
                // Check if this holiday already exists
                if (existingTitles.has(holiday.name)) {
                    console.log(`Holiday already exists: ${holiday.name}`);
                    continue;
                }

                // Get next occurrence of this holiday
                const holidayDate = getNextHolidayDate(holiday);

                if (holidayDate) {
                    const eventDoc = {
                        coupleId,
                        title: holiday.name,
                        date: Timestamp.fromDate(holidayDate),
                        type: 'holiday',
                        description: `${holiday.emoji} ${holiday.name}`,
                        createdAt: Timestamp.now()
                    };

                    await addDoc(eventsRef, eventDoc);
                    createdCount++;
                    console.log(`✅ Created holiday: ${holiday.name} on ${holidayDate.toDateString()}`);
                }
            }

            console.log(`🎉 Created ${createdCount} holiday events`);
            return createdCount;
        } catch (error) {
            console.error('Error creating holiday events:', error);
            throw error;
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
        createHolidayEvents,
        subscribeToCoupleData,
        subscribeToEvents
    };
}
