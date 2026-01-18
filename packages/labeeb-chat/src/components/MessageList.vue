<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import type { Message } from '../types/messages';
import type { ToolStatus } from '../composables/useLabeebChat';
import MessageBubble from './MessageBubble.vue';
import StreamingIndicator from './StreamingIndicator.vue';

export interface MessageListProps {
  messages: readonly Message[] | Message[];
  streamingContent: string;
  toolStatus: ToolStatus | null;
  isLoading: boolean;
  sessionId: string | null;
  token: string;
  hasPendingApproval: boolean;
  complexQueryNotice: string | null;
  largeDataNotice: string | null;
}

const props = defineProps<MessageListProps>();

const emit = defineEmits<{
  feedback: [messageId: string, type: 'positive' | 'negative'];
  regenerate: [];
  clearComplexQueryNotice: [];
  handleApproval: [decision: 'approve' | 'reject', reason?: string, sessionId?: string];
}>();

const messagesEndRef = ref<HTMLDivElement | null>(null);

// Find the last assistant message ID
const lastAssistantMessageId = computed(() => {
  const assistantMessages = props.messages.filter(m => m.role === 'assistant');
  const lastMessage = assistantMessages.at(-1);
  return lastMessage?.id ?? null;
});

// Auto-scroll to bottom when messages change
watch(
  () => [props.messages, props.streamingContent, props.isLoading, props.toolStatus],
  async () => {
    await nextTick();
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' });
  },
  { deep: true }
);

function handleFeedback(messageId: string, type: 'positive' | 'negative') {
  emit('feedback', messageId, type);
}

function handleRegenerate() {
  emit('regenerate');
}

function onClearComplexQueryNotice() {
  emit('clearComplexQueryNotice');
}

function onApproval(decision: 'approve' | 'reject', reason?: string, sessionId?: string) {
  emit('handleApproval', decision, reason, sessionId);
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-6 space-y-6">
    <!-- Messages -->
    <template v-for="msg in messages" :key="msg.id">
      <!-- HITL Card (Human-in-the-Loop) -->
      <div v-if="msg.role === 'hitl' && msg.hitlData" class="flex justify-start">
        <div class="max-w-2xl w-full">
          <!-- HITL Card will be rendered here - placeholder for now -->
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-lg">⚠️</span>
              <span class="font-medium text-amber-800 dark:text-amber-200">Action Requires Approval</span>
            </div>
            <p class="text-sm text-amber-700 dark:text-amber-300 mb-3">
              {{ msg.hitlData.tool_name }}
            </p>
            <div
              v-if="msg.hitlData.status === 'pending'"
              class="flex gap-2"
            >
              <button
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                @click="onApproval('approve', undefined, msg.hitlData?.session_id)"
              >
                Approve
              </button>
              <button
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                @click="onApproval('reject', undefined, msg.hitlData?.session_id)"
              >
                Reject
              </button>
            </div>
            <div v-else class="text-sm">
              <span
                :class="msg.hitlData.status === 'approved'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'"
              >
                {{ msg.hitlData.status === 'approved' ? '✓ Approved' : '✗ Rejected' }}
              </span>
            </div>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {{ msg.timestamp.toLocaleTimeString() }}
          </div>
        </div>
      </div>

      <!-- Regular Message Bubble -->
      <MessageBubble
        v-else
        :message="msg"
        :is-last-assistant-message="msg.id === lastAssistantMessageId"
        :session-id="sessionId"
        :token="token"
        :is-loading="isLoading"
        :has-pending-approval="hasPendingApproval"
        @feedback="handleFeedback"
        @regenerate="handleRegenerate"
      />
    </template>

    <!-- Complex Query Notice -->
    <div
      v-if="complexQueryNotice"
      class="flex justify-start animate-in slide-in-from-top-2 duration-300"
    >
      <div class="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 px-4 py-3 rounded-r-lg max-w-lg">
        <span class="text-lg flex-shrink-0">ℹ️</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-blue-800 dark:text-blue-200 leading-relaxed mb-2">
            {{ complexQueryNotice }}
          </p>
          <a
            href="/ai-orbit/insights"
            class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
          >
            Explore BI Tools
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        <button
          class="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex-shrink-0"
          @click="onClearComplexQueryNotice"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Streaming / Loading / Tool Status Indicator -->
    <StreamingIndicator
      :streaming-content="streamingContent"
      :tool-status="toolStatus"
      :is-loading="isLoading"
    />

    <!-- Large Data Notice -->
    <div
      v-if="largeDataNotice && !complexQueryNotice"
      class="flex justify-start animate-in slide-in-from-top-2 duration-300"
    >
      <div class="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-500 px-4 py-3 rounded-r-lg max-w-lg">
        <span class="text-lg flex-shrink-0">📊</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-purple-800 dark:text-purple-200 leading-relaxed mb-2">
            {{ largeDataNotice }}
          </p>
          <a
            href="/ai-orbit/insights"
            class="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline"
          >
            Explore BI Tools
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Scroll anchor -->
    <div ref="messagesEndRef" />
  </div>
</template>
