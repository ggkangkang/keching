<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card card-glass fade-in">
        <div class="logo-section">
          <div class="heart-icon heartbeat">❤️</div>
          <h1>Together Forever</h1>
          <p class="subtitle">Track your love story</p>
        </div>

        <form @submit.prevent="handleSubmit" class="login-form">
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="form-group">
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder="Email"
              required
            />
          </div>

          <div class="form-group">
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder="Password"
              required
            />
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>{{ isLoginMode ? 'Login' : 'Sign Up' }}</span>
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <button 
            type="button"
            class="btn btn-secondary"
            @click="handleGoogleLogin"
            :disabled="loading"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div class="toggle-mode">
            <button 
              type="button"
              @click="isLoginMode = !isLoginMode"
              class="link-button"
            >
              {{ isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Login' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { login, register, loginWithGoogle, error, loading } = useAuth();

const email = ref('');
const password = ref('');
const isLoginMode = ref(true);

const handleSubmit = async () => {
  try {
    if (isLoginMode.value) {
      await login(email.value, password.value);
    } else {
      await register(email.value, password.value);
    }
    
    // Check for saved redirect path
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    } else {
      router.push('/');
    }
  } catch (err) {
    console.error('Authentication error:', err);
  }
};

const handleGoogleLogin = async () => {
  try {
    await loginWithGoogle();
    
    // Check for saved redirect path
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    } else {
      router.push('/');
    }
  } catch (err) {
    console.error('Google login error:', err);
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background: var(--app-background);
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  padding: var(--spacing-2xl);
  background: var(--glass-background);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
}

.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.heart-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
  display: inline-block;
  filter: drop-shadow(0 4px 12px rgba(242, 166, 121, 0.4));
}

.logo-section h1 {
  background: var(--gradient-warm);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-top: var(--spacing-xs);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.error-message {
  padding: var(--spacing-sm);
  background: rgba(255, 0, 64, 0.1);
  border: 1px solid rgba(255, 0, 64, 0.2);
  border-radius: var(--radius-sm);
  color: #d63031;
  font-size: 0.9rem;
}

.input {
  background: rgba(255, 255, 255, 0.6);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.input::placeholder {
  color: var(--text-secondary);
}

.divider {
  position: relative;
  text-align: center;
  margin: var(--spacing-sm) 0;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: var(--glass-border);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: transparent;
  padding: 0 var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.toggle-mode {
  text-align: center;
  margin-top: var(--spacing-sm);
}

.link-button {
  background: none;
  border: none;
  color: var(--primary-accent);
  cursor: pointer;
  font-size: 0.95rem;
  text-decoration: underline;
  transition: color var(--transition-fast);
}

.link-button:hover {
  color: var(--primary-accent-dark);
}

.btn svg {
  width: 20px;
  height: 20px;
}
</style>
