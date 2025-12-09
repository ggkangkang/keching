import { ref } from 'vue';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    Timestamp,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const invitations = ref([]);
const loading = ref(false);

export function useInvitations() {
    // Generate unique invite code
    const generateInviteCode = () => {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    };

    // Create invitation
    const createInvitation = async (coupleId, fromUserId, fromUserName, partnerEmail) => {
        try {
            loading.value = true;
            const inviteCode = generateInviteCode();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

            const invitationData = {
                coupleId,
                fromUserId,
                fromUserName,
                toEmail: partnerEmail,
                toUserId: null,
                status: 'pending',
                inviteCode,
                createdAt: Timestamp.now(),
                expiresAt: Timestamp.fromDate(expiresAt),
                acceptedAt: null
            };

            const invitationRef = await addDoc(collection(db, 'invitations'), invitationData);

            // Update couple document with invitation status
            const coupleRef = doc(db, 'couples', coupleId);
            await updateDoc(coupleRef, {
                partner2Email: partnerEmail,
                invitationStatus: 'pending',
                invitationSentAt: Timestamp.now()
            });

            return {
                id: invitationRef.id,
                ...invitationData,
                inviteLink: `${window.location.origin}/invite/${inviteCode}`
            };
        } catch (error) {
            console.error('Error creating invitation:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Get invitation by code
    const getInvitationByCode = async (inviteCode) => {
        try {
            loading.value = true;
            const invitationsRef = collection(db, 'invitations');
            const q = query(invitationsRef, where('inviteCode', '==', inviteCode));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                throw new Error('Invitation not found');
            }

            const invitationDoc = snapshot.docs[0];
            const invitation = { id: invitationDoc.id, ...invitationDoc.data() };

            // Check if expired
            const now = new Date();
            const expiresAt = invitation.expiresAt.toDate();
            if (now > expiresAt) {
                throw new Error('Invitation has expired');
            }

            // Check if already accepted
            if (invitation.status === 'accepted') {
                throw new Error('Invitation has already been accepted');
            }

            return invitation;
        } catch (error) {
            console.error('Error getting invitation:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Accept invitation
    const acceptInvitation = async (invitationId, userId) => {
        try {
            loading.value = true;

            // Get invitation
            const invitationRef = doc(db, 'invitations', invitationId);
            const invitationSnap = await getDoc(invitationRef);

            if (!invitationSnap.exists()) {
                throw new Error('Invitation not found');
            }

            const invitation = invitationSnap.data();

            // Update invitation
            await updateDoc(invitationRef, {
                status: 'accepted',
                toUserId: userId,
                acceptedAt: Timestamp.now()
            });

            // Update couple document
            const coupleRef = doc(db, 'couples', invitation.coupleId);
            await updateDoc(coupleRef, {
                userId2: userId,
                invitationStatus: 'accepted',
                updatedAt: Timestamp.now()
            });

            return { success: true, coupleId: invitation.coupleId };
        } catch (error) {
            console.error('Error accepting invitation:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Reject invitation
    const rejectInvitation = async (invitationId) => {
        try {
            loading.value = true;
            const invitationRef = doc(db, 'invitations', invitationId);
            await updateDoc(invitationRef, {
                status: 'rejected',
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error rejecting invitation:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Get pending invitations for a user (by email)
    const getPendingInvitationsByEmail = async (email) => {
        try {
            loading.value = true;
            const invitationsRef = collection(db, 'invitations');
            const q = query(
                invitationsRef,
                where('toEmail', '==', email),
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(q);

            invitations.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return invitations.value;
        } catch (error) {
            console.error('Error getting pending invitations:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Get invitation for a couple
    const getInvitationByCoupleId = async (coupleId) => {
        try {
            loading.value = true;
            const invitationsRef = collection(db, 'invitations');
            const q = query(
                invitationsRef,
                where('coupleId', '==', coupleId),
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return null;
            }

            const invitationDoc = snapshot.docs[0];
            return { id: invitationDoc.id, ...invitationDoc.data() };
        } catch (error) {
            console.error('Error getting invitation:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Cancel invitation
    const cancelInvitation = async (invitationId, coupleId) => {
        try {
            loading.value = true;

            // Delete invitation
            await deleteDoc(doc(db, 'invitations', invitationId));

            // Update couple document
            const coupleRef = doc(db, 'couples', coupleId);
            await updateDoc(coupleRef, {
                partner2Email: '',
                invitationStatus: '',
                invitationSentAt: null
            });
        } catch (error) {
            console.error('Error canceling invitation:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    return {
        invitations,
        loading,
        createInvitation,
        getInvitationByCode,
        acceptInvitation,
        rejectInvitation,
        getPendingInvitationsByEmail,
        getInvitationByCoupleId,
        cancelInvitation
    };
}
