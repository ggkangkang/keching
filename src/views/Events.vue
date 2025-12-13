<template>
  <div class="events-page">
    <div class="events-container container">
      <div class="page-header">
        <div class="header-content">
          <h1>Our Special Moments</h1>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && events.length === 0" class="loading-state flex-center">
        <div class="spinner"></div>
      </div>

      <!-- No Events -->
      <div v-else-if="events.length === 0" class="no-events card text-center fade-in">
        <div class="empty-icon">📅</div>
        <h3>No events yet</h3>
        <p>Start adding your special moments and milestones!</p>
        <button @click="showAddModal = true" class="btn btn-primary mt-3">
          Add Your First Event
        </button>
      </div>

      <!-- Events List -->
      <div v-else class="events-list fade-in">
        <div 
          v-for="event in sortedEvents" 
          :key="event.id"
          class="event-card card"
          @mousedown="startLongPress(event)"
          @touchstart="startLongPress(event)"
          @mouseup="cancelLongPress"
          @mouseleave="cancelLongPress"
          @touchend="cancelLongPress"
          @touchmove="cancelLongPress"
        >
          <div class="event-icon">{{ getEventIcon(event) }}</div>
          <div class="event-content">
            <h3>{{ event.title }}</h3>
            <p v-if="event.description" class="event-description">
              {{ event.description }}
            </p>
            <div class="event-meta">
              <span class="event-date">{{ formatEventDate(event.date) }}</span>
              <span class="event-countdown">{{ getCountdown(event.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Event Modal -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-content card fade-in">
          <h2>Add New Event</h2>
          <form @submit.prevent="handleAddEvent" class="event-form">
            <div class="form-group">
              <label>Event Title</label>
              <input
                v-model="newEvent.title"
                type="text"
                class="input"
                placeholder="e.g., Our Anniversary"
                required
              />
            </div>

            <div class="form-group">
              <label>Event Type</label>
              <select v-model="newEvent.type" class="input" required>
                <option value="anniversary">Anniversary</option>
                <option value="holiday">Holiday</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div class="form-group">
              <label>Emoji (Optional)</label>
              <div class="emoji-picker">
                <input
                  v-model="newEvent.emoji"
                  type="text"
                  class="input emoji-input"
                  placeholder="Choose an emoji... 🎉"
                  maxlength="2"
                />
                <div class="emoji-suggestions">
                  <button
                    v-for="emoji in emojiSuggestions"
                    :key="emoji"
                    type="button"
                    class="emoji-btn"
                    @click="newEvent.emoji = emoji"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Date</label>
              <input
                v-model="newEvent.date"
                type="date"
                class="input"
                required
              />
            </div>

            <div class="form-group">
              <label>Description (Optional)</label>
              <textarea
                v-model="newEvent.description"
                class="input"
                rows="3"
                placeholder="Add a note about this event..."
              ></textarea>
            </div>

            <div class="modal-actions">
              <button 
                type="button" 
                @click="showAddModal = false" 
                class="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner"></span>
                <span v-else>Add Event</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- Floating Action Button -->
    <button class="fab-button" @click="showAddModal = true">
      +
    </button>

    <!-- Action Sheet Modal -->
    <div v-if="showActionSheet" class="modal-overlay" @click.self="closeActionSheet">
      <div class="action-sheet fade-up">
        <h3>Event Options</h3>
        <button class="action-btn delete" @click="confirmDeleteEvent">
          🗑️ Delete Event
        </button>
        <button class="action-btn cancel" @click="closeActionSheet">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useCoupleData } from '../composables/useCoupleData';

const { user } = useAuth();
const { 
  coupleData,
  events, 
  loading,
  getCoupleData,
  getEvents,
  addEvent,
  deleteEvent,
  subscribeToEvents
} = useCoupleData();

const showAddModal = ref(false);
const newEvent = ref({
  title: '',
  type: 'custom',
  date: '',
  description: '',
  emoji: ''
});

const emojiSuggestions = [
  '🎉', '💝', '🎂', '🎄', '🎃', '🌟', '💕', '🎁',
  '🌹', '🎊', '🥳', '🎈', '💐', '🍰', '🎆', '✨'
];

let unsubscribeEvents = null;

onMounted(async () => {
  if (user.value) {
    await getCoupleData(user.value.uid);
    if (coupleData.value) {
      // Set up real-time sync for events
      unsubscribeEvents = subscribeToEvents(coupleData.value.id);
    }
  }
});

onUnmounted(() => {
  // Clean up subscription
  if (unsubscribeEvents) unsubscribeEvents();
});

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    return a.date.toMillis() - b.date.toMillis();
  });
});

const getEventIcon = (event) => {
  // Use custom emoji if provided
  if (event.emoji) {
    return event.emoji;
  }
  
  // For holiday events, try to extract emoji from description
  if (event.type === 'holiday' && event.description) {
    const emojiMatch = event.description.match(/[\p{Emoji}]/u);
    if (emojiMatch) {
      return emojiMatch[0];
    }
  }
  
  // Fall back to type-based icons
  const icons = {
    anniversary: '💕',
    holiday: '🎄',
    birthday: '🎂',
    custom: '⭐'
  };
  return icons[event.type] || '📅';
};

const formatEventDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const getCountdown = (timestamp) => {
  if (!timestamp) return '';
  
  const eventDate = timestamp.toDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days ago`;
  } else if (diffDays === 0) {
    return 'Today! 🎉';
  } else if (diffDays === 1) {
    return 'Tomorrow!';
  } else {
    return `In ${diffDays} days`;
  }
};

const handleAddEvent = async () => {
  try {
    await addEvent(coupleData.value.id, newEvent.value);
    showAddModal.value = false;
    newEvent.value = {
      title: '',
      type: 'custom',
      date: '',
      description: '',
      emoji: ''
    };
  } catch (error) {
    console.error('Error adding event:', error);
    alert('Failed to add event. Please try again.');
  }
};

const showActionSheet = ref(false);
const selectedEvent = ref(null);
let longPressTimer = null;

const startLongPress = (event) => {
  longPressTimer = setTimeout(() => {
    selectedEvent.value = event;
    showActionSheet.value = true;
    // Vibratte if supported
    if (navigator.vibrate) navigator.vibrate(50);
  }, 800); // 800ms long press
};

const cancelLongPress = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
};

const closeActionSheet = () => {
  showActionSheet.value = false;
  selectedEvent.value = null;
};

const confirmDeleteEvent = async () => {
  if (selectedEvent.value && confirm('Are you sure you want to delete this event?')) {
    try {
      await deleteEvent(selectedEvent.value.id);
      closeActionSheet();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  }
};
</script>

<style scoped>
.events-page {
  min-height: 100vh;
  padding: 0 var(--spacing-md) 100px var(--spacing-md);
  overflow-x: hidden;
}

.events-container {
  max-width: 900px;
  margin: 0 auto;
  padding-top: var(--spacing-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.page-header h1 {
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sync-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary-accent);
  box-shadow: var(--shadow-sm);
  animation: pulse-glow 3s infinite;
}

.loading-state,
.no-events {
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-events {
  flex-direction: column;
  background: var(--glass-background);
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  backdrop-filter: blur(20px);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.no-events h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.no-events p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.event-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--spacing-lg);
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--glass-background);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.event-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--gradient-warm);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.event-card:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.6);
  border-color: var(--primary-accent);
  box-shadow: var(--shadow-soft);
}

.event-card:hover::before {
  opacity: 1;
}

.event-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
}

.event-content {
  flex: 1;
}

.event-content h3 {
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
  font-size: 1.2rem;
}

.event-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 0.9rem;
}

.event-date {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.event-date::before {
  content: '📅';
  font-size: 0.8em;
  opacity: 0.7;
}

.event-countdown {
  color: var(--text-on-accent);
  font-weight: 600;
  background: var(--primary-accent);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  box-shadow: 0 2px 8px rgba(242, 166, 121, 0.3);
}

.delete-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.4;
  transition: all var(--transition-fast);
  padding: var(--spacing-xs);
  color: var(--text-secondary);
}

.delete-button:hover {
  opacity: 1;
  color: #ff4757;
  transform: scale(1.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-content {
  max-width: 500px;
  width: 100%;
  padding: var(--spacing-xl);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(20px);
}

.modal-content h2 {
  font-size: 1.8rem;
  margin-bottom: var(--spacing-lg);
  text-align: center;
  color: var(--text-primary);
}

.event-form {
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
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-left: 2px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
  font-family: var(--font-primary);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: var(--spacing-sm);
  transition: var(--transition-fast);
}

.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-accent);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 3px rgba(242, 166, 121, 0.15);
}

/* Emoji Picker */
.emoji-picker {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.emoji-input {
  font-size: 1.5rem;
  text-align: center;
}

.emoji-suggestions {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-xs);
}

.emoji-btn {
  padding: var(--spacing-sm);
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
  border-color: var(--primary-accent);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.modal-actions button {
  flex: 1;
}

/* FAB Button */
.fab-button {
  position: fixed;
  bottom: 110px; /* Adjusted to sit clearly above the floating nav bar */
  right: var(--spacing-lg);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-accent);
  color: white;
  border: none;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(242, 166, 121, 0.4);
  cursor: pointer;
  z-index: 99;
  transition: transform var(--transition-normal);
  -webkit-tap-highlight-color: transparent; /* Remove tap highlight */
}

.fab-button:hover {
  transform: scale(1.1) rotate(90deg);
}

.fab-button:active {
  transform: scale(0.95);
}

/* Action Sheet */
.action-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--glass-background);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-top: 1px solid var(--glass-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  animation: slideUp 0.3s ease-out;
  padding-bottom: max(var(--spacing-lg), env(safe-area-inset-bottom)); /* Safe area for iPhone home bar */
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.action-sheet h3 {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: var(--spacing-xs);
}

.action-btn {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.5);
  transition: background var(--transition-fast);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.8);
}

.action-btn.delete {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.action-btn.cancel {
  margin-top: var(--spacing-xs);
  color: var(--text-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }
  
  .event-card {
    grid-template-columns: auto 1fr;
    gap: var(--spacing-md);
  }
  
  .event-card:active {
    transform: scale(0.98);
  }
  
  /* Remove old delete button styles if any remain */
  .delete-button {
    display: none;
  }

  .event-icon {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
  
  .event-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-top: var(--spacing-xs);
  }
}
</style>
