<template>
  <div class="settings-page">
    <div class="settings-container container">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <div class="settings-content fade-in">
        <!-- Account Section -->
        <div class="settings-section card-glass">
          <h2>Account</h2>
          <div class="user-info">
            <div class="info-row">
              <span class="label">Email</span>
              <span class="value">{{ user?.email }}</span>
            </div>
            <div class="info-row">
              <span class="label">User ID</span>
              <span class="value code">{{ user?.uid.slice(0, 8) }}...</span>
            </div>
          </div>
        </div>



        <!-- Danger Zone -->
        <div class="settings-section danger-zone card-glass">
          <h2>Session</h2>
          <p>Sign out of your account on this device.</p>
          <button @click="handleLogout" class="btn btn-danger">
            <span class="icon">👋</span>
            Sign Out
          </button>
        </div>

        <div class="app-version">
            Version 1.0.8 • Keching
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { PhGear } from '@phosphor-icons/vue';

const router = useRouter();
const { user, logout } = useAuth();

const handleLogout = async () => {
  try {
    await logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 0 var(--spacing-md) 100px var(--spacing-md);
  overflow-x: hidden;
}

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding-top: var(--spacing-xl);
}

.page-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.page-header h1 {
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.settings-section {
  padding: var(--spacing-lg);
  background: var(--glass-background);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.settings-section h2 {
  font-size: 1.2rem;
  color: var(--primary-accent);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--glass-border);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
}

.label {
  color: var(--text-secondary);
  font-weight: 500;
}

.value {
  color: var(--text-primary);
  font-weight: 600;
}

.value.code {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.5);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--primary-accent);
  border: 1px solid var(--glass-border);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.setting-label {
  color: var(--text-primary);
  font-weight: 500;
}

.setting-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
}

/* Toggle Switch Mockup */
.toggle-switch {
  width: 50px;
  height: 28px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-switch.active {
  background: var(--primary-accent);
  border: 1px solid var(--primary-accent);
}

.toggle-thumb {
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 2px;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(22px);
  background: white;
  box-shadow: none;
}

.danger-zone {
  border-color: rgba(255, 0, 85, 0.2);
  background: rgba(255, 0, 85, 0.05);
}

.danger-zone h2 {
  color: #ff4757;
  border-color: rgba(255, 0, 85, 0.2);
}

.danger-zone p {
  color: var(--text-secondary);
}

.btn-danger {
  width: 100%;
  margin-top: var(--spacing-md);
  background: rgba(255, 0, 85, 0.1);
  color: #ff4757;
  border: 1px solid rgba(255, 0, 85, 0.3);
  padding: var(--spacing-sm);
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.btn-danger:hover {
  background: rgba(255, 0, 85, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 0, 85, 0.2);
}

.app-version {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: var(--spacing-lg);
  opacity: 0.7;
}

@media (max-width: 768px) {
  .settings-container {
    padding-top: var(--spacing-lg);
  }
}
</style>
