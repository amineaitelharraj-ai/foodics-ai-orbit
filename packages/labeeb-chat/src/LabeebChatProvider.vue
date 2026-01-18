<script setup lang="ts">
import { provide } from 'vue';
import { useLabeebChat } from './composables/useLabeebChat';

export interface LabeebChatProviderProps {
  token: string;
  idToken?: string;
  baseUrl?: string;
}

const props = defineProps<LabeebChatProviderProps>();

const emit = defineEmits<{
  tokenExpired: [];
}>();

// Initialize the chat composable
const chat = useLabeebChat({
  token: props.token,
  idToken: props.idToken,
  baseUrl: props.baseUrl,
  onTokenExpired: () => emit('tokenExpired'),
});

// Provide the chat context to all child components
provide('labeeb-chat', chat);

// Also expose for direct access via template ref
defineExpose({
  ...chat,
});
</script>

<template>
  <slot
    :messages="chat.messages"
    :is-connected="chat.isConnected"
    :is-loading="chat.isLoading"
    :pending-approval="chat.pendingApproval"
    :streaming-content="chat.streamingContent"
    :current-session-id="chat.currentSessionId"
    :sessions="chat.sessions"
    :error="chat.error"
    :tool-status="chat.toolStatus"
    :complex-query-notice="chat.complexQueryNotice"
    :large-data-notice="chat.largeDataNotice"
    :query-clarification="chat.queryClarification"
    :send-message="chat.sendMessage"
    :handle-approval="chat.handleApproval"
    :handle-clarification-proceed="chat.handleClarificationProceed"
    :handle-clarification-refine="chat.handleClarificationRefine"
    :handle-clarification-cancel="chat.handleClarificationCancel"
    :start-new-session="chat.startNewSession"
    :load-session="chat.loadSession"
    :delete-session="chat.deleteSession"
    :update-hitl-image-url="chat.updateHitlImageUrl"
    :clear-error="chat.clearError"
    :clear-complex-query-notice="chat.clearComplexQueryNotice"
  />
</template>
