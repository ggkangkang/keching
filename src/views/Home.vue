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
        <div class="days-counter">
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

/* Days Counter */
.days-counter {
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
}

.days-counter::before {
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

.counter-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.days-number {
  font-size: 4.5rem;
  font-weight: 800;
  font-family: var(--font-display);
  line-height: 1;
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 12px rgba(242, 166, 121, 0.3));
}

.days-label {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.date-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
  opacity: 0.8;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-accent);
  box-shadow: 0 10px 25px rgba(242, 166, 121, 0.2);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-xs);
  filter: grayscale(0.2);
  transition: filter var(--transition-normal);
}

.stat-card:hover .stat-icon {
  filter: grayscale(0) drop-shadow(0 4px 8px rgba(242, 166, 121, 0.3));
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
</style>
