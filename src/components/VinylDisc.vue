<template>
  <div class="vinyl-container">
    <div 
      class="vinyl-disc" 
      :class="{ 'playing': isPlaying }"
      @click="$emit('toggle')"
    >
      <div class="vinyl-grooves"></div>
      <div class="vinyl-label">
        <div class="vinyl-center"></div>
      </div>
    </div>
    
    <div class="music-controls">
      <div class="now-playing" v-if="currentTitle">
        <span class="music-icon">🎵</span>
        <div class="scrolling-text">
          <span>{{ currentTitle }}</span>
        </div>
      </div>
      <div class="now-playing placeholder" v-else>
        <span>Select Music</span>
      </div>
      
      <button class="menu-btn" @click="$emit('open-menu')">
        ⚙️
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isPlaying: Boolean,
  currentTitle: String
});
</script>

<style scoped>
.vinyl-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
}

.vinyl-disc {
  width: 120px;
  height: 120px;
  background: #1a1a1a;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.vinyl-disc:active {
  transform: scale(0.95);
}

.vinyl-grooves {
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: 
    repeating-radial-gradient(
      #1a1a1a,
      #1a1a1a 2px,
      #2a2a2a 3px,
      #1a1a1a 4px
    );
}

.vinyl-label {
  width: 40px;
  height: 40px;
  background: var(--primary-accent);
  border-radius: 50%;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.2);
}

.vinyl-center {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Rotation Animation */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-disc.playing {
  animation: rotate 3s linear infinite;
}

.music-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--glass-background);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-primary);
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
}

.placeholder {
  color: var(--text-secondary);
  font-style: italic;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  opacity: 0.7;
}

.menu-btn:hover {
  opacity: 1;
}
</style>
