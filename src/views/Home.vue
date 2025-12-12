<template>
  <div class="home-page">
    <div class="home-container container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state flex-center">
        <div class="spinner"></div>
      </div>

      <!-- Setup Required -->
      <div v-else-if="!coupleData" class="setup-required fade-in">
        <div class="card text-center">
          <h2>Welcome! 💕</h2>
          <p>Let's set up your couple profile first</p>
          <button @click="$router.push('/setup')" class="btn btn-primary mt-3">
            Get Started
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="main-content fade-in">
        <!-- Profile Section -->
        <div class="profile-section">
          <div class="profiles-container">
            <!-- Partner 1 -->
            <div class="profile-card">
              <div class="profile-picture-wrapper">
                <img 
                  v-if="coupleData.partner1Photo" 
                  :src="coupleData.partner1Photo" 
                  alt="Partner 1"
                  class="profile-picture"
                />
                <img 
                  v-else
                  src="/images/boy_avatar.png" 
                  alt="Partner 1"
                  class="profile-picture"
                />
                <label class="upload-button">
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="(e) => handlePhotoUpload(e, 'partner1Photo')"
                    hidden
                  />
                  📷
                </label>
              </div>
              <div class="name-container">
                <button @click="openEditModal('partner1')" class="edit-btn" title="Edit Profile">✏️</button>
                <h3>
                  {{ coupleData.partner1Name }}
                  <span v-if="coupleData.partner1Birthday" class="zodiac-icon" :title="getZodiacSign(coupleData.partner1Birthday)?.name">
                    {{ getZodiacSign(coupleData.partner1Birthday)?.icon }}
                  </span>
                </h3>
              </div>
            </div>

            <!-- Love Heart -->
            <div class="heart-container">
              <div class="heart heartbeat">❤️</div>
            </div>

            <!-- Partner 2 -->
            <div class="profile-card">
              <div class="profile-picture-wrapper">
                <img 
                  v-if="coupleData.partner2Photo" 
                  :src="coupleData.partner2Photo" 
                  alt="Partner 2"
                  class="profile-picture"
                />
                <img 
                  v-else
                  src="/images/girl_avatar.png" 
                  alt="Partner 2"
                  class="profile-picture"
                />
                <label class="upload-button">
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="(e) => handlePhotoUpload(e, 'partner2Photo')"
                    hidden
                  />
                  📷
                </label>
              </div>
              <div class="name-container">
                <button @click="openEditModal('partner2')" class="edit-btn" title="Edit Profile">✏️</button>
                <h3>
                  {{ coupleData.partner2Name }}
                  <span v-if="coupleData.partner2Birthday" class="zodiac-icon" :title="getZodiacSign(coupleData.partner2Birthday)?.name">
                    {{ getZodiacSign(coupleData.partner2Birthday)?.icon }}
                  </span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Invite Partner Section -->
        <div v-if="!coupleData.userId2" class="invite-section card-glass">
          <h3>💌 Invite Your Partner</h3>
          <p>Share your couple profile and sync your love story together!</p>
          <button @click="showInviteModal = true" class="btn btn-primary mt-2">
            Send Invitation
          </button>
          <p v-if="pendingInvitation" class="invitation-status mt-2">
            ✉️ Invitation sent to {{ pendingInvitation.toEmail }}
            <button @click="handleCancelInvitation" class="link-button">Cancel</button>
          </p>
        </div>

        <!-- Sync Status -->



        <!-- Main Counter Card -->
        <div class="main-counter-card">
          <button class="swap-btn" @click="toggleDisplayMode" title="Switch View">
            <ph-arrows-clockwise :size="24" weight="bold" />
          </button>
          
          <div class="counter-content">
            <div class="counter-number text-gradient" :key="displayMode">
              {{ displayValue }}
            </div>
            <div class="counter-label">{{ displayLabel }}</div>
            <div class="date-info">
              Since {{ formatDate(coupleData.firstDayTogether) }}
            </div>
          </div>
        </div>

        <!-- Next Special Moment -->
        <div v-if="nearestEvent" class="next-event-card card" @click="$router.push('/events')">
          <div class="next-event-header">
            <span class="next-label">Up Next</span>
            <span class="next-countdown">{{ getCountdown(nearestEvent.date) }}</span>
          </div>
          <div class="next-event-content">
            <div class="next-event-icon">
              {{ nearestEvent.type === 'birthday' ? '🎂' : 
                 nearestEvent.type === 'anniversary' ? '💕' : 
                 nearestEvent.type === 'holiday' ? '🎄' : '⭐' }}
            </div>
            <div class="next-event-details">
              <h3>{{ nearestEvent.title }}</h3>
              <p>{{ formatDate(nearestEvent.date) }}</p>
            </div>
            <div class="chevron">›</div>
          </div>
        </div>
        
        <div v-else class="next-event-card card empty-state" @click="$router.push('/events')">
           <div class="next-event-content">
            <div class="next-event-icon">📅</div>
             <div class="next-event-details">
              <h3>No Upcoming Events</h3>
              <p>Add a special moment!</p>
            </div>
            <div class="chevron">›</div>
           </div>
        </div>
      </div>
    </div>

    <!-- Invite Partner Modal -->
    <InvitePartner
      :show="showInviteModal"
      :couple-id="coupleData?.id"
      :user-id="user?.uid"
      :user-name="coupleData?.partner1Name"
      @close="showInviteModal = false"
      @invitation-sent="handleInvitationSent"
    />

    <!-- Edit Profile Modal -->
    <div v-if="showEditProfileModal" class="modal-overlay" @click.self="showEditProfileModal = false">
      <div class="modal-content card fade-in">
        <h2>Edit Profile ✏️</h2>
        <form @submit.prevent="handleSaveProfile" class="edit-form">
          <div class="form-group">
            <label>Name</label>
            <input v-model="editForm.name" type="text" class="input" required />
          </div>
          <div class="form-group">
            <label>Birthday</label>
            <input v-model="editForm.birthday" type="date" class="input" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditProfileModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useCoupleData } from '../composables/useCoupleData';
import { useInvitations } from '../composables/useInvitations';
import InvitePartner from '../components/InvitePartner.vue';
import { getZodiacSign } from '../utils/zodiac';
import { PhArrowsClockwise } from '@phosphor-icons/vue';

const { user } = useAuth();
const { 
  coupleData, 
  events,
  loading, 
  daysTogetherCount,
  getCoupleData,
  uploadProfilePicture,
  updateCoupleProfile,
  subscribeToCoupleData,
  subscribeToEvents
} = useCoupleData();

const { getInvitationByCoupleId, cancelInvitation } = useInvitations();

const showInviteModal = ref(false);
const showEditProfileModal = ref(false);
const editingPartner = ref(null); // 'partner1' or 'partner2'
const editForm = ref({
  name: '',
  birthday: ''
});
const pendingInvitation = ref(null);
let unsubscribeCouple = null;
let unsubscribeEvents = null;

onMounted(async () => {
  if (user.value) {
    await getCoupleData(user.value.uid);
    
    // Set up real-time sync
    if (coupleData.value?.id) {
      unsubscribeCouple = subscribeToCoupleData(coupleData.value.id);
      unsubscribeEvents = subscribeToEvents(coupleData.value.id);
      
      // Check for pending invitation
      const invitation = await getInvitationByCoupleId(coupleData.value.id);
      pendingInvitation.value = invitation;
    }
  }
});

onUnmounted(() => {
  // Clean up subscriptions
  if (unsubscribeCouple) unsubscribeCouple();
  if (unsubscribeEvents) unsubscribeEvents();
});

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const yearsMonths = computed(() => {
  if (!coupleData.value?.firstDayTogether) return { years: 0, months: 0 };
  
  const firstDay = coupleData.value.firstDayTogether.toDate();
  const today = new Date();
  
  let years = today.getFullYear() - firstDay.getFullYear();
  let months = today.getMonth() - firstDay.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months };
});

const displayMode = ref('days'); // 'days', 'months', 'years', 'hours'

const toggleDisplayMode = () => {
  const modes = ['days', 'months', 'years', 'hours'];
  const currentIndex = modes.indexOf(displayMode.value);
  displayMode.value = modes[(currentIndex + 1) % modes.length];
};

const displayValue = computed(() => {
  if (!coupleData.value?.firstDayTogether) return 0;
  
  switch (displayMode.value) {
    case 'days':
      return daysTogetherCount.value;
    case 'months':
      return yearsMonths.value.years * 12 + yearsMonths.value.months;
    case 'years':
      return yearsMonths.value.years;
    case 'hours':
      return totalHours.value;
    default:
      return daysTogetherCount.value;
  }
});

const displayLabel = computed(() => {
  switch (displayMode.value) {
    case 'days': return 'Days Together';
    case 'months': return 'Months Together';
    case 'years': return 'Years Together';
    case 'hours': return 'Hours Together';
    default: return 'Days Together';
  }
});

const nearestEvent = computed(() => {
  if (!events.value || events.value.length === 0) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter for future events (including today)
  const upcoming = events.value.filter(e => {
    const d = e.date.toDate();
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });
  
  if (upcoming.length === 0) return null;
  
  // Sort by date ascending
  return upcoming.sort((a, b) => a.date.toMillis() - b.date.toMillis())[0];
});

const getCountdown = (timestamp) => {
  if (!timestamp) return '';
  const eventDate = timestamp.toDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today! 🎉';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
};


const handlePhotoUpload = async (event, field) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const url = await uploadProfilePicture(file, field);
    await updateCoupleProfile(coupleData.value.id, { [field]: url });
  } catch (error) {
    console.error('Error uploading photo:', error);
    alert('Failed to upload photo. Please try again.');
  }
};

const handleInvitationSent = (invitation) => {
  pendingInvitation.value = invitation;
};

const handleCancelInvitation = async () => {
  if (confirm('Are you sure you want to cancel this invitation?')) {
    try {
      await cancelInvitation(pendingInvitation.value.id, coupleData.value.id);
      pendingInvitation.value = null;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      alert('Failed to cancel invitation');
    }
  }
};

const openEditModal = (partner) => {
  editingPartner.value = partner;
  if (partner === 'partner1') {
    editForm.value = {
      name: coupleData.value.partner1Name,
      birthday: coupleData.value.partner1Birthday || ''
    };
  } else {
    editForm.value = {
      name: coupleData.value.partner2Name,
      birthday: coupleData.value.partner2Birthday || ''
    };
  }
  showEditProfileModal.value = true;
};

const handleSaveProfile = async () => {
  try {
    const updates = {};
    if (editingPartner.value === 'partner1') {
      updates.partner1Name = editForm.value.name;
      updates.partner1Birthday = editForm.value.birthday;
    } else {
      updates.partner2Name = editForm.value.name;
      updates.partner2Birthday = editForm.value.birthday;
    }
    
    await updateCoupleProfile(coupleData.value.id, updates);
    showEditProfileModal.value = false;
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile');
  }
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 0 var(--spacing-md) 100px var(--spacing-md);
  overflow-x: hidden;
}

.home-container {
  max-width: 900px;
  margin: 0 auto;
  padding-top: var(--spacing-xl);
}

.loading-state,
.setup-required {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Profile Section */
.profiles-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--spacing-lg);
  align-items: center;
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.profile-picture-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  transition: transform var(--transition-normal);
}

.profile-picture-wrapper:hover {
  transform: scale(1.05);
}

.profile-picture,
.profile-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-accent);
  box-shadow: 0 0 20px rgba(242, 166, 121, 0.3);
  background: var(--glass-background);
}

.profile-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-warm);
  color: #fff;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.upload-button {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 36px;
  height: 36px;
  background: var(--primary-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(242, 166, 121, 0.4);
  font-size: 1rem;
  transition: transform var(--transition-fast);
  color: #fff;
  border: 2px solid #fff;
}

.upload-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 15px rgba(242, 166, 121, 0.6);
}

.profile-card h3 {
  font-size: 1.2rem;
  color: var(--text-primary);
  font-weight: 600;
}

.heart-container {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(242, 166, 121, 0.3));
}

.heart {
  font-size: 3rem;
  background: linear-gradient(135deg, #F2A679 0%, #FF8E53 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Main Counter Card */
.main-counter-card {
  padding: var(--spacing-xl);
  text-align: center;
  background: var(--glass-background);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.main-counter-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(242, 166, 121, 0.1) 0%, transparent 70%);
  animation: pulse-glow 4s ease-in-out infinite;
  pointer-events: none;
}

.swap-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-normal);
  z-index: 2;
}

.swap-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  color: var(--primary-accent);
  transform: rotate(180deg);
}

.counter-number {
  font-size: 4.5rem;
  font-weight: 800;
  font-family: var(--font-display);
  line-height: 1;
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 12px rgba(242, 166, 121, 0.3));
  transition: opacity 0.3s ease;
}

.counter-label {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: var(--spacing-xs);
}

.date-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
  opacity: 0.8;
}

/* Next Event Card */
.next-event-card {
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: transform var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.next-event-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.6);
}

.next-event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.next-label {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  font-weight: 600;
}

.next-countdown {
  background: var(--primary-accent);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.8rem;
}

.next-event-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.next-event-icon {
  font-size: 1.8rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  border: 1px solid var(--glass-border);
}

.next-event-details {
  flex: 1;
}

.next-event-details h3 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.next-event-details p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.chevron {
  font-size: 1.5rem;
  color: var(--text-secondary);
  opacity: 0.5;
}

.empty-state {
  opacity: 0.8;
}

/* Invite Section */
.invite-section {
  padding: var(--spacing-xl);
  text-align: center;
  margin-bottom: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.invite-section h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.invite-section p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.invitation-status {
  font-size: 0.9rem;
  color: var(--primary-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.link-button {
  background: none;
  border: none;
  color: var(--text-primary);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  opacity: 0.7;
}

.link-button:hover {
  opacity: 1;
  color: var(--primary-accent);
}

/* Sync Status */
.sync-status {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.sync-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .profiles-container {
    /* Side-by-side avatars with heart in middle on mobile */
    grid-template-columns: 1fr auto 1fr;
    gap: var(--spacing-sm); /* Tighten gap for mobile */
  }
  
  .heart-container {
    order: 0; /* Keeps heart in the middle (DOM order: partner1, heart, partner2) */
    margin-bottom: 0;
    z-index: 1;
    transform: scale(0.8); /* Slightly smaller heart on mobile */
  }
  
  /* Stack names under avatars cleanly */
  .profile-card {
    gap: var(--spacing-xs);
  }

  .profile-card h3 {
    font-size: 1rem;
    text-align: center;
    max-width: 100px; /* Prevent long names from breaking layout */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .days-number {
    font-size: 3.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-picture-wrapper {
    /* Responsive resizing */
    width: 80px; 
    height: 80px;
  }
}
/* Small phones support */
@media (max-width: 380px) {
  .profile-picture-wrapper {
    width: 60px;
    height: 60px;
  }
}

.name-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.name-container h3 {
  margin: 0;
  /* display: flex; Removed to allow text-overflow: ellipsis to work if needed */
  /* align-items: center; */
}

.edit-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity var(--transition-fast);
  padding: 4px; /* easier to click */
  display: flex;
  align-items: center;
}

.edit-btn:hover {
  opacity: 1;
}

.zodiac-icon {
  font-size: 0.9em;
  margin-left: 4px;
  cursor: help;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

.modal-content h2 {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-left: 2px;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.modal-actions button {
  flex: 1;
}
</style>
