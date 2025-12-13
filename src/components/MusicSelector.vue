<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card fade-in">
      <div class="modal-header">
        <h2>Music Collection 🎵</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Upload Section -->
      <div class="upload-section">
        <label class="btn btn-primary upload-btn" :class="{ 'disabled': uploading }">
          <input 
            type="file" 
            accept="audio/*" 
            @change="handleFileUpload" 
            :disabled="uploading"
            hidden
          >
          <ph-spinner v-if="uploading" class="spinner-icon rotate" size="20" />
          <ph-upload-simple v-else size="20" weight="bold" />
          <span>{{ uploading ? 'Uploading...' : 'Upload New Track' }}</span>
        </label>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>

      <!-- Search Bar -->
      <div class="search-bar">
        <ph-magnifying-glass size="18" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search tracks..." 
          class="search-input"
        >
      </div>

      <!-- Music List -->
      <div class="music-list">
        <div 
          v-for="track in filteredMusicList" 
          :key="track.id" 
          class="track-item"
          :class="{ 'active': currentBgmUrl === track.url }"
        >
          <div class="track-info" @click="setBGM(track)">
            <button class="btn-icon play-btn">
              <span v-if="currentBgmUrl === track.url && isPlaying">
                <ph-pause size="20" weight="fill" />
              </span>
              <span v-else>
                <ph-play size="20" weight="fill" />
              </span>
            </button>
            <span class="track-title" :title="track.title">{{ track.title }}</span>
          </div>
          
          <div class="track-actions">
            <!-- Set BGM Button (Optional now since play does it, but kept for clarity) -->
            <button 
              v-if="currentBgmUrl !== track.url"
              class="btn-icon select-btn" 
              @click.stop="setBGM(track)"
              title="Set as Background Music"
            >
              Set BGM
            </button>
            
            <!-- Playing Indicator -->
            <div v-else class="playing-indicator">
              <span class="bars">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
              </span>
            </div>
            
            <!-- Delete Button -->
            <button 
              class="btn-icon delete-btn" 
              @click.stop="handleDelete(track)"
              title="Delete Track"
            >
              <ph-trash size="18" />
            </button>
          </div>
        </div>
        
        <div v-if="filteredMusicList.length === 0" class="empty-state">
          <div class="empty-icon">💿</div>
          <p v-if="searchQuery">No tracks match your search.</p>
          <p v-else>No music yet. Upload your favorite songs to start the party! 🎉</p>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useMusic } from '../composables/useMusic';
import { useAuth } from '../composables/useAuth';
import { useCoupleData } from '../composables/useCoupleData';
import { useAudioPlayer } from '../composables/useAudioPlayer';
import { 
  PhUploadSimple, 
  PhMagnifyingGlass, 
  PhPlay, 
  PhPause, 
  PhTrash, 
  PhSpinner 
} from '@phosphor-icons/vue';


const props = defineProps(['currentBgmUrl']);
const emit = defineEmits(['close']);

const { user } = useAuth();
const { coupleData } = useCoupleData();
const { uploadMusic, getMusicList, setCoupleBGM, deleteMusic, uploading, error } = useMusic();
const { isPlaying, togglePlay, setTrack } = useAudioPlayer();

const musicList = ref([]);
const searchQuery = ref('');
let unsubscribe = null;

onMounted(() => {
  if (coupleData.value?.id) {
    unsubscribe = getMusicList(coupleData.value.id, (data) => {
      musicList.value = data;
    });
  }
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const filteredMusicList = computed(() => {
  if (!searchQuery.value) return musicList.value;
  const query = searchQuery.value.toLowerCase();
  return musicList.value.filter(track => 
    track.title.toLowerCase().includes(query)
  );
});

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    await uploadMusic(file, coupleData.value.id, user.value.uid);
  } catch (e) {
    // Error handled in composable state
  }
};

const setBGM = async (track) => {
  // If clicking currently playing track, just toggle
  if (props.currentBgmUrl === track.url) {
    togglePlay();
  } else {
    // Optimistically play the track immediately
    setTrack(track.url);
    // Set new BGM (Firestore update will trigger App watcher to play, setTrack handles consistency)
    await setCoupleBGM(coupleData.value.id, track);
  }
};

const handleDelete = async (track) => {
  if (confirm(`Delete "${track.title}"?`)) {
    await deleteMusic(coupleData.value.id, track.id, track.storagePath);
  }
};
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.modal-header h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.upload-section {
  text-align: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--glass-border);
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: linear-gradient(135deg, #F2A679 0%, #FF8E53 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 25px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(242, 166, 121, 0.4);
  transition: all var(--transition-fast);
  border: none;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(242, 166, 121, 0.5);
}

.upload-btn.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  gap: 8px;
}

.search-icon {
  color: var(--text-secondary);
}

.search-input {
  border: none;
  background: none;
  width: 100%;
  outline: none;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.music-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 350px;
  overflow-y: auto;
  padding-right: 4px;
}

.track-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.track-item:hover {
  background: white;
  transform: translateX(2px);
  box-shadow: var(--shadow-sm);
}

.track-item.active {
  border: 1px solid var(--primary-accent);
  background: rgba(242, 166, 121, 0.1);
}

.track-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
  min-width: 0; /* Enable truncation */
}

.play-btn {
  color: var(--primary-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.track-title {
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 8px;
}

.select-btn {
  font-size: 0.8rem;
  padding: 4px 10px;
  background: var(--primary-accent);
  color: white;
  border-radius: 12px;
  opacity: 0.8;
  border: none;
  cursor: pointer;
}

.select-btn:hover {
  opacity: 1;
}

.delete-btn {
  color: var(--text-secondary);
  opacity: 0.6;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.delete-btn:hover {
  color: #ff4757;
  opacity: 1;
}

.playing-indicator {
  display: flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
}

.bars {
  display: flex;
  align-items: flex-end;
  height: 12px;
  gap: 2px;
}

.bar {
  width: 3px;
  background: var(--primary-accent);
  animation: equalize 1s infinite;
}

.bar:nth-child(1) { animation-delay: 0s; height: 6px; }
.bar:nth-child(2) { animation-delay: 0.2s; height: 10px; }
.bar:nth-child(3) { animation-delay: 0.4s; height: 8px; }

@keyframes equalize {
  0% { height: 4px; }
  50% { height: 12px; }
  100% { height: 4px; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-secondary);
  padding: var(--spacing-xl);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: var(--spacing-sm);
}

.error-msg {
  color: #ff4757;
  font-size: 0.85rem;
  margin-top: 5px;
}

.spinner-icon.rotate {
  animation: rotate 1s linear infinite;
}

/* Scrollbar styling */
.music-list::-webkit-scrollbar {
  width: 6px;
}

.music-list::-webkit-scrollbar-track {
  background: transparent;
}

.music-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
</style>
