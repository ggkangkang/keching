<template>
  <div id="app">
    <!-- Global Audio Player -->
    <!-- Global Audio Player (using visibility:hidden to ensure mobile browsers don't optimize it out like display:none might) -->
    <audio ref="audioRef" loop style="position: absolute; bottom: 0; opacity: 0; pointer-events: none; width: 1px; height: 1px;"></audio>

    <nav v-if="isAuthenticated && !isLoginPage" class="main-nav">
      <div class="nav-container container">
        <div class="nav-brand">
          <span class="brand-icon">❤️</span>
          <span class="brand-text">Keching</span>
        </div>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="nav-icon"><ph-house :size="24" /></span>
            <span>Home</span>
          </router-link>
          <router-link to="/events" class="nav-link">
            <span class="nav-icon"><ph-calendar-heart :size="24" /></span>
            <span>Events</span>
          </router-link>
          <router-link to="/settings" class="nav-link">
            <span class="nav-icon"><ph-gear :size="24" /></span>
            <span>Settings</span>
          </router-link>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from './composables/useAuth';
import { useCoupleData } from './composables/useCoupleData';
import { useAudioPlayer } from './composables/useAudioPlayer';
import { PhHouse, PhCalendarHeart, PhGear } from '@phosphor-icons/vue';

const router = useRouter();
const route = useRoute();
const { isAuthenticated, user } = useAuth();
const { coupleData, getCoupleData, subscribeToCoupleData } = useCoupleData();
const { audioRef, setTrack, setSource, setupAudioListeners } = useAudioPlayer();

const isLoginPage = computed(() => route.path === '/login');

let unsubscribeCouple = null;

// Setup audio event listeners when component mounts
onMounted(() => {
  setupAudioListeners();
});

// Global Data & Music Management
watch(() => user.value, async (newUser) => {
  if (newUser) {
    if (!coupleData.value) {
      await getCoupleData(newUser.uid);
    }
    
    if (coupleData.value?.id && !unsubscribeCouple) {
      unsubscribeCouple = subscribeToCoupleData(coupleData.value.id);
    }
  } else {
    if (unsubscribeCouple) {
      unsubscribeCouple();
      unsubscribeCouple = null;
    }
  }
}, { immediate: true });

// Sync BGM with Audio Player (load source only, don't autoplay for iOS)
watch(() => coupleData.value?.bgmUrl, (newUrl) => {
  if (newUrl) {
    setSource(newUrl); // Use setSource instead of setTrack to avoid autoplay
  }
});

onUnmounted(() => {
  if (unsubscribeCouple) unsubscribeCouple();
});
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--app-background);
}

.main-nav {
  position: fixed;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  width: auto; /* Allow auto width based on content */
  min-width: 250px;
  max-width: 90%;
  z-index: 100;
  border-radius: var(--radius-full);
  padding: var(--spacing-xs);
  
  /* Warm Glassmorphism */
  background: var(--glass-background);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 30px rgba(242, 166, 121, 0.15);
}

.nav-container {
  display: flex;
  justify-content: center; /* Center links in the pill */
  align-items: center;
  padding: 0 var(--spacing-xs);
  height: 60px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  display: none; /* Hide brand entirely on mobile */
}

.brand-text {
  display: none; 
}

.brand-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 10px rgba(242, 166, 121, 0.5));
}

.nav-links {
  display: flex;
  gap: var(--spacing-sm); /* Increased gap for better spacing */
  align-items: center;
}

.nav-link {
  display: flex;
  flex-direction: row; /* Icon and text side-by-side */
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition-fast);
  background: none;
  border: none;
  cursor: pointer;
  width: auto; /* Allow width to grow */
  height: 48px;
  gap: var(--spacing-xs);
}

.nav-link span:last-child {
  display: none; /* Hide label by default on mobile */
  font-size: 0.9rem;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--primary-accent);
}

.nav-link.router-link-active {
  color: var(--text-on-accent);
  background: var(--primary-accent);
  box-shadow: 0 4px 12px rgba(242, 166, 121, 0.4);
}

.nav-link.router-link-active span:last-child {
  display: block; /* Show label when active */
  animation: fade-in 0.3s ease-out;
}

.nav-icon {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  transition: none; /* Remove transform transition */
}

/* Remove the icon transform on active state */
.nav-link.router-link-active .nav-icon {
  transform: none;
  filter: none;
  color: var(--text-on-accent);
}

.logout-btn {
  color: var(--color-secondary);
}

.main-content {
  flex: 1;
  padding-bottom: 120px; /* Space for fixed bottom nav */
}

/* Desktop styles */
@media (min-width: 769px) {
  .main-nav {
    top: var(--spacing-md);
    bottom: auto;
    width: 95%;
    max-width: 1200px;
    padding: var(--spacing-xs) var(--spacing-md);
    min-width: unset;
  }
  
  .nav-container {
    padding: 0;
    justify-content: space-between; /* Space out brand and links */
  }

  .nav-brand {
    display: flex; /* Show brand on desktop */
  }

  .nav-links {
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
  
  .nav-link {
    height: auto;
    padding: var(--spacing-xs) var(--spacing-md);
    background: transparent !important; /* Reset background for desktop */
    box-shadow: none !important;
    color: var(--text-secondary);
  }

  .nav-link span:last-child {
    display: block; /* Always show label on desktop */
  }
  
  .nav-link.router-link-active {
    color: var(--primary-accent);
  }
  
  .nav-link.router-link-active .nav-icon {
    color: var(--primary-accent);
  }

  .brand-text {
    display: block;
    background: var(--gradient-warm);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .main-content {
    padding-bottom: var(--spacing-xl);
    padding-top: 100px;
  }
}
</style>
