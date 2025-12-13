<template>
  <div class="setup-page">
    <div class="setup-container container">
      <div class="setup-card card fade-in">
        <h1 class="text-center">💕 Set Up Your Love Story</h1>
        <p class="text-center text-light mb-4">
          Tell us about your relationship
        </p>

        <form @submit.prevent="handleSubmit" class="setup-form">
          <div class="form-row">
            <div class="form-group">
              <label>Partner 1 Name</label>
              <input
                v-model="formData.partner1Name"
                type="text"
                class="input"
                placeholder="Your name"
                required
              />
            </div>

            <div class="form-group">
              <label>Partner 2 Name</label>
              <input
                v-model="formData.partner2Name"
                type="text"
                class="input"
                placeholder="Partner's name"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>First Day Together</label>
            <input
              v-model="formData.firstDayTogether"
              type="date"
              class="input"
              required
            />
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-else>Create Profile ❤️</span>
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
import { useCoupleData } from '../composables/useCoupleData';

const router = useRouter();
const { user } = useAuth();
const { createCoupleProfile, createHolidayEvents, loading } = useCoupleData();

const formData = ref({
  partner1Name: '',
  partner2Name: '',
  firstDayTogether: ''
});

const handleSubmit = async () => {
  try {
    const newProfile = await createCoupleProfile(user.value.uid, formData.value);
    
    // Auto-create holiday events for new couple
    if (newProfile?.id) {
      try {
        await createHolidayEvents(newProfile.id);
        console.log('✅ Holiday events created for new couple');
      } catch (error) {
        console.error('Error creating holiday events:', error);
        // Don't block profile creation if holiday creation fails
      }
    }
    
    router.push('/');
  } catch (error) {
    console.error('Error creating profile:', error);
    alert('Failed to create profile. Please try again.');
  }
};
</script>

<style scoped>
.setup-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.setup-container {
  max-width: 600px;
}

.setup-card {
  padding: var(--spacing-2xl);
  background: rgba(30, 30, 36, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.text-light {
  color: var(--color-text-muted);
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-weight: 500;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-left: 2px;
}

.form-actions {
  margin-top: var(--spacing-md);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
