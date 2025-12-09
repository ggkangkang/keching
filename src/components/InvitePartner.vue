<template>
  <div class="invite-partner-modal" v-if="show">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content card fade-in">
      <h2>💌 Invite Your Partner</h2>
      <p class="subtitle">Share your love story together</p>

      <div v-if="!invitationCreated" class="invite-form">
        <div class="form-group">
          <label>Partner's Email</label>
          <input
            v-model="partnerEmail"
            type="email"
            class="input"
            placeholder="partner@example.com"
            required
          />
        </div>

        <div class="form-actions">
          <button @click="$emit('close')" class="btn btn-secondary">
            Cancel
          </button>
          <button 
            @click="handleSendInvitation" 
            class="btn btn-primary"
            :disabled="loading || !partnerEmail"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>Send Invitation</span>
          </button>
        </div>
      </div>

      <div v-else class="invitation-success">
        <div class="success-icon">✅</div>
        <h3>Invitation Created!</h3>
        <p>Share this link with your partner:</p>
        
        <div class="invite-link-box">
          <input 
            ref="linkInput"
            :value="inviteLink" 
            readonly 
            class="input link-input"
            @click="selectLink"
          />
          <button @click="copyLink" class="btn btn-primary copy-btn">
            {{ copied ? '✓ Copied!' : '📋 Copy' }}
          </button>
        </div>

        <p class="help-text">
          Your partner can click this link to join your couple profile.
          The invitation expires in 7 days.
        </p>

        <button @click="$emit('close')" class="btn btn-secondary mt-3">
          Done
        </button>
      </div>

      <div v-if="error" class="error-message mt-2">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useInvitations } from '../composables/useInvitations';

const props = defineProps({
  show: Boolean,
  coupleId: String,
  userId: String,
  userName: String
});

const emit = defineEmits(['close', 'invitation-sent']);

const { createInvitation, loading } = useInvitations();

const partnerEmail = ref('');
const invitationCreated = ref(false);
const inviteLink = ref('');
const copied = ref(false);
const error = ref(null);
const linkInput = ref(null);

const handleSendInvitation = async () => {
  try {
    error.value = null;
    const invitation = await createInvitation(
      props.coupleId,
      props.userId,
      props.userName,
      partnerEmail.value
    );
    
    inviteLink.value = invitation.inviteLink;
    invitationCreated.value = true;
    emit('invitation-sent', invitation);
  } catch (err) {
    error.value = err.message || 'Failed to create invitation';
  }
};

const selectLink = () => {
  if (linkInput.value) {
    linkInput.value.select();
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    // Fallback for older browsers
    selectLink();
    document.execCommand('copy');
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};
</script>

<style scoped>
.invite-partner-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  max-width: 500px;
  width: 100%;
  padding: var(--spacing-xl);
  max-height: 90vh;
  overflow-y: auto;
}

.subtitle {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
}

.invite-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-weight: 600;
  color: var(--color-text);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.form-actions button {
  flex: 1;
}

.invitation-success {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.invitation-success h3 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.invite-link-box {
  display: flex;
  gap: var(--spacing-sm);
  margin: var(--spacing-lg) 0;
}

.link-input {
  flex: 1;
  font-size: 0.9rem;
  font-family: monospace;
}

.copy-btn {
  white-space: nowrap;
}

.help-text {
  font-size: 0.9rem;
  color: var(--color-text-light);
  line-height: 1.5;
}

.error-message {
  padding: var(--spacing-sm);
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: var(--radius-sm);
  color: #c0392b;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .invite-link-box {
    flex-direction: column;
  }
  
  .copy-btn {
    width: 100%;
  }
}
</style>
