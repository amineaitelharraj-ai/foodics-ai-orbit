<script setup lang="ts">
import { ref, computed } from 'vue';
import { Copy, Check, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-vue-next';
import type { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer.vue';

// Props interface
interface Props {
  message: Message;
  isLastAssistantMessage?: boolean;
  sessionId?: string | null;
  token?: string;
  isLoading?: boolean;
  hasPendingApproval?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLastAssistantMessage: false,
  sessionId: null,
  token: '',
  isLoading: false,
  hasPendingApproval: false,
});

// Emits
const emit = defineEmits<{
  feedback: [messageId: string, type: 'positive' | 'negative'];
  regenerate: [];
}>();

// Copy state
const copied = ref(false);

// Feedback state
const feedbackGiven = ref<'positive' | 'negative' | null>(null);

// Computed properties
const isUserMessage = computed(() => props.message.role === 'user');
const isAssistantMessage = computed(() => props.message.role === 'assistant');

const bubbleClasses = computed(() => {
  if (isUserMessage.value) {
    return 'bg-primary-500 text-white';
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white';
});

const timestampClasses = computed(() => {
  if (isUserMessage.value) {
    return 'text-primary-100';
  }
  return 'text-gray-500 dark:text-gray-400';
});

const formattedTimestamp = computed(() => {
  const timestamp = props.message.timestamp;
  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString();
  }
  // Handle string timestamp
  return new Date(timestamp).toLocaleTimeString();
});

const canRegenerate = computed(() => {
  return (
    props.isLastAssistantMessage &&
    !props.isLoading &&
    !props.hasPendingApproval
  );
});

// Methods
async function handleCopy(): Promise<void> {
  if (!props.message.content) return;

  try {
    await navigator.clipboard.writeText(props.message.content);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

function handleFeedback(type: 'positive' | 'negative'): void {
  // If same feedback already given, don't do anything
  if (feedbackGiven.value === type) return;

  feedbackGiven.value = type;
  emit('feedback', props.message.id, type);
}

function handleRegenerate(): void {
  if (!canRegenerate.value) return;
  emit('regenerate');
}

/**
 * Simple markdown-like text processing for user messages only
 * Assistant messages use full MarkdownRenderer component
 */
function processUserContent(content: string): string {
  if (!content) return '';

  // Escape HTML first
  let processed = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text** or __text__
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  processed = processed.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Inline code: `code`
  processed = processed.replace(
    /`([^`]+)`/g,
    '<code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono">$1</code>'
  );

  // Line breaks
  processed = processed.replace(/\n/g, '<br>');

  return processed;
}

const userRenderedContent = computed(() => processUserContent(props.message.content));
</script>

<template>
  <div
    class="flex"
    :class="isUserMessage ? 'justify-end' : 'justify-start'"
  >
    <div class="group relative max-w-3xl">
      <!-- Message bubble -->
      <div
        class="px-4 py-3 rounded-2xl"
        :class="bubbleClasses"
      >
        <!-- Message content -->
        <div v-if="isUserMessage" class="prose prose-sm max-w-none break-words" v-html="userRenderedContent" />
        <MarkdownRenderer v-else :content="message.content" :enable-copy="true" />

        <!-- Timestamp -->
        <div
          class="text-xs mt-2"
          :class="timestampClasses"
        >
          {{ formattedTimestamp }}
        </div>
      </div>

      <!-- Assistant message actions -->
      <template v-if="isAssistantMessage && message.content">
        <!-- Copy button (top right of bubble) -->
        <button
          class="absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
          :class="
            copied
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
          "
          :title="copied ? 'Copied!' : 'Copy to clipboard'"
          @click="handleCopy"
        >
          <Check v-if="copied" class="w-4 h-4" />
          <Copy v-else class="w-4 h-4" />
        </button>

        <!-- Feedback and regenerate buttons -->
        <div class="flex items-center gap-3 mt-2">
          <!-- Feedback buttons -->
          <div class="flex items-center gap-1">
            <button
              class="p-1.5 rounded-md transition-all duration-200"
              :class="
                feedbackGiven === 'positive'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              "
              title="Good response"
              @click="handleFeedback('positive')"
            >
              <ThumbsUp class="w-4 h-4" />
            </button>
            <button
              class="p-1.5 rounded-md transition-all duration-200"
              :class="
                feedbackGiven === 'negative'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              "
              title="Bad response"
              @click="handleFeedback('negative')"
            >
              <ThumbsDown class="w-4 h-4" />
            </button>
          </div>

          <!-- Regenerate button (only for last assistant message) -->
          <button
            v-if="isLastAssistantMessage"
            class="flex items-center gap-1.5 px-2 py-1 text-sm rounded-md transition-all duration-200"
            :class="
              canRegenerate
                ? 'hover:bg-gray-100 text-gray-500 hover:text-gray-700 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                : 'opacity-50 cursor-not-allowed text-gray-400'
            "
            :disabled="!canRegenerate"
            title="Regenerate response"
            @click="handleRegenerate"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
            <span>Regenerate</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles for prose content */
.prose :deep(strong) {
  font-weight: 600;
}

.prose :deep(em) {
  font-style: italic;
}

.prose :deep(code) {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
}

/* Ensure proper word breaking for long content */
.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
