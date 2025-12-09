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
                <div v-else class="profile-placeholder">
                  <span>{{ getInitials(coupleData.partner1Name) }}</span>
                </div>
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
              <h3>{{ coupleData.partner1Name }}</h3>
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
                <div v-else class="profile-placeholder">
                  <span>{{ getInitials(coupleData.partner2Name) }}</span>
                </div>
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
              <h3>{{ coupleData.partner2Name }}</h3>
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
        <div v-if="coupleData.userId2" class="sync-status">
          <span class="sync-indicator">✅ Synced with {{ coupleData.partner2Name }}</span>
        </div>


        <!-- Days Counter -->
        <div class="days-counter card-glass">
          <div class="counter-content">
            <div class="days-number text-gradient">{{ daysTogetherCount }}</div>
            <div class="days-label">Days Together</div>
            <div class="date-info">
              Since {{ formatDate(coupleData.firstDayTogether) }}
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">{{ yearsMonths.years }}</div>
            <div class="stat-label">Years</div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">🌙</div>
            <div class="stat-value">{{ yearsMonths.months }}</div>
            <div class="stat-label">Months</div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">⏰</div>
            <div class="stat-value">{{ totalHours }}</div>
            <div class="stat-label">Hours</div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useCoupleData } from '../composables/useCoupleData';
import { useInvitations } from '../composables/useInvitations';
import InvitePartner from '../components/InvitePartner.vue';

const { user } = useAuth();
const { 
  coupleData, 
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

const totalHours = computed(() => {
  return (daysTogetherCount.value * 24).toLocaleString();
});

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
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--gradient-romantic);
  padding: var(--spacing-lg);
}

.home-container {
  max-width: 900px;
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.loading-state {
  min-height: 60vh;
}

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
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.profile-picture-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}

.profile-picture,
.profile-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: var(--shadow-romantic);
}

.profile-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-love);
  color: white;
  font-size: 3rem;
  font-weight: 700;
}

.upload-button {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  font-size: 1.2rem;
  transition: transform var(--transition-fast);
}

.upload-button:hover {
  transform: scale(1.1);
}

.profile-card h3 {
  font-size: 1.5rem;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.heart-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart {
  font-size: 4rem;
  filter: drop-shadow(0 4px 12px rgba(255, 107, 157, 0.5));
}

/* Days Counter */
.days-counter {
  padding: var(--spacing-2xl);
  text-align: center;
  border-radius: var(--radius-lg);
}

.counter-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.days-number {
  font-size: 5rem;
  font-weight: 800;
  font-family: var(--font-display);
  line-height: 1;
}

.days-label {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.date-info {
  font-size: 1rem;
  color: var(--color-text-light);
  margin-top: var(--spacing-xs);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  padding: var(--spacing-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.95rem;
  color: var(--color-text-light);
  font-weight: 500;
}

/* Invite Section */
.invite-section {
  padding: var(--spacing-xl);
  text-align: center;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}

.invite-section h3 {
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.invite-section p {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
}

.invitation-status {
  font-size: 0.9rem;
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.link-button {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.link-button:hover {
  color: var(--color-primary-dark);
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
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}


/* Responsive */
@media (max-width: 768px) {
  .profiles-container {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .heart-container {
    order: -1;
  }
  
  .days-number {
    font-size: 3.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-picture-wrapper {
    width: 120px;
    height: 120px;
  }
}
</style>
