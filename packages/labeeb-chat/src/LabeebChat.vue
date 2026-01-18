<script setup lang="ts">
import { computed, watch } from 'vue';
import { Zap } from 'lucide-vue-next';
import { useLabeebChat, type UseLabeebChatOptions } from './composables/useLabeebChat';
import MessageList from './components/MessageList.vue';
import ChatInput from './components/ChatInput.vue';
import QueryClarification from './components/QueryClarification.vue';

export interface LabeebChatProps {
  /** Authentication token for WebSocket connection */
  token: string;
  /** Optional ID token for additional auth */
  idToken?: string;
  /** Base URL for the WebSocket server */
  baseUrl?: string;
  /** Custom title for the chat header */
  title?: string;
  /** Custom subtitle for the chat header */
  subtitle?: string;
  /** Whether to show the header */
  showHeader?: boolean;
  /** Suggestion questions for empty state */
  suggestions?: Array<{ label: string; query: string }>;
}

const props = withDefaults(defineProps<LabeebChatProps>(), {
  title: 'AI Assistant',
  subtitle: 'Your intelligent business companion',
  showHeader: true,
  suggestions: () => [
    { label: 'List my products', query: 'List my products' },
    { label: 'Show categories', query: 'Show me all my categories' },
    { label: 'View branches', query: 'What branches do I have?' },
    { label: 'Top customers', query: 'Who are my top 5 customers by spending?' },
    { label: 'Sales this week', query: 'Show me my sales trend for the last 7 days' },
    { label: 'Recent orders', query: 'Show me my recent orders' },
  ],
});

const emit = defineEmits<{
  tokenExpired: [];
  messageSent: [message: string];
  sessionChanged: [sessionId: string | null];
}>();

// Initialize chat composable
const chatOptions: UseLabeebChatOptions = {
  token: props.token,
  idToken: props.idToken,
  baseUrl: props.baseUrl,
  onTokenExpired: () => emit('tokenExpired'),
};

const chat = useLabeebChat(chatOptions);

const {
  messages,
  isConnected,
  isLoading,
  pendingApproval,
  streamingContent,
  currentSessionId,
  sessions,
  error,
  toolStatus,
  complexQueryNotice,
  largeDataNotice,
  queryClarification,
  sendMessage,
  handleApproval,
  handleClarificationProceed,
  handleClarificationRefine,
  handleClarificationCancel,
  startNewSession,
  loadSession,
  deleteSession,
  clearError,
  clearComplexQueryNotice,
} = chat;

// Watch for session changes
watch(currentSessionId, (newId) => {
  emit('sessionChanged', newId);
});

// Computed
const showSuggestions = computed(() => messages.value.length === 0);
const hasPendingApproval = computed(() => !!pendingApproval.value);

// Cast messages to mutable type for component props
const messagesList = computed(() => [...messages.value] as import('./types/messages').Message[]);

// Cast query clarification filters
const clarificationFilters = computed(() =>
  queryClarification.value?.suggestedFilters
    ? [...queryClarification.value.suggestedFilters]
    : []
);

// Handlers
function onSendMessage(message: string) {
  sendMessage(message);
  emit('messageSent', message);
}

function onFeedback(messageId: string, type: 'positive' | 'negative') {
  console.log(`Feedback: ${type} for message ${messageId}`);
}

function onRegenerate() {
  const lastUserMessage = [...messages.value]
    .reverse()
    .find(m => m.role === 'user');
  if (lastUserMessage?.content && !isLoading.value) {
    sendMessage(lastUserMessage.content);
  }
}

function onHandleApproval(
  decision: 'approve' | 'reject',
  reason?: string,
  sessionId?: string
) {
  handleApproval(decision, reason, sessionId);
}

function onClearComplexQueryNotice() {
  clearComplexQueryNotice();
}

function onClarificationProceed() {
  handleClarificationProceed();
}

function onClarificationRefine(refinement: string) {
  handleClarificationRefine(refinement);
}

function onClarificationCancel() {
  handleClarificationCancel();
}

// Expose methods for parent components
defineExpose({
  messages,
  isConnected,
  isLoading,
  currentSessionId,
  sessions,
  sendMessage,
  startNewSession,
  loadSession,
  deleteSession,
});
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-900">
    <!-- Header -->
    <div
      v-if="showHeader"
      class="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Zap class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ title }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ subtitle }}
            </p>
          </div>
        </div>
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Messages Area -->
    <MessageList
      :messages="messagesList"
      :streaming-content="streamingContent"
      :tool-status="toolStatus"
      :is-loading="isLoading"
      :session-id="currentSessionId"
      :token="token"
      :has-pending-approval="hasPendingApproval"
      :complex-query-notice="complexQueryNotice"
      :large-data-notice="largeDataNotice"
      @feedback="onFeedback"
      @regenerate="onRegenerate"
      @clear-complex-query-notice="onClearComplexQueryNotice"
      @handle-approval="onHandleApproval"
    />

    <!-- Input Area -->
    <ChatInput
      :is-connected="isConnected"
      :is-loading="isLoading"
      :error="error"
      :has-pending-approval="hasPendingApproval"
      :show-suggestions="showSuggestions"
      :suggestions="suggestions"
      @send="onSendMessage"
      @clear-error="clearError"
    />

    <!-- Query Clarification Modal -->
    <QueryClarification
      v-if="queryClarification"
      :session-id="queryClarification.sessionId"
      :tool-name="queryClarification.toolName"
      :message="queryClarification.message"
      :suggested-filters="clarificationFilters"
      @proceed="onClarificationProceed"
      @refine="onClarificationRefine"
      @cancel="onClarificationCancel"
    />
  </div>
</template>

<style scoped>
/* Ensure the component takes full height when used standalone */
.flex-col.h-full {
  min-height: 400px;
}
</style>
