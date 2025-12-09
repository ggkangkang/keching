<template>
  <div id="app">
    <nav v-if="isAuthenticated && !isLoginPage" class="main-nav">
      <div class="nav-container container">
        <div class="nav-brand">
          <span class="brand-icon">❤️</span>
          <span class="brand-text">Together</span>
        </div>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="nav-icon">🏠</span>
            <span>Home</span>
          </router-link>
          <router-link to="/events" class="nav-link">
            <span class="nav-icon">📅</span>
            <span>Events</span>
          </router-link>
          <button @click="handleLogout" class="nav-link logout-btn">
            <span class="nav-icon">👋</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from './composables/useAuth';

const router = useRouter();
const route = useRoute();
const { isAuthenticated, logout } = useAuth();

const isLoginPage = computed(() => route.path === '/login');

const handleLogout = async () => {
  try {
    await logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
}

.brand-icon {
  font-size: 1.8rem;
}

.brand-text {
  background: var(--gradient-love);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: var(--spacing-sm);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  transition: all var(--transition-fast);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-family: var(--font-primary);
}

.nav-link:hover,
.nav-link.router-link-active {
  background: var(--gradient-love);
  color: white;
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 1.2rem;
}

.logout-btn {
  margin-left: var(--spacing-sm);
}

.main-content {
  flex: 1;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-around;
  }
  
  .nav-link span:not(.nav-icon) {
    display: none;
  }
  
  .nav-link {
    padding: var(--spacing-xs);
  }
}
</style>
