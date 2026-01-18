<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { Send, Mic, Paperclip, Wifi, WifiOff, X } from 'lucide-vue-next'

/**
 * Suggestion item structure for quick action chips
 */
interface Suggestion {
  label: string
  query: string
}

/**
 * Props for the ChatInput component
 */
interface Props {
  /** Whether the WebSocket is connected */
  isConnected: boolean
  /** Whether the chat is currently loading/processing */
  isLoading: boolean
  /** Error message to display, if any */
  error: string | null
  /** Whether there's a pending approval blocking input */
  hasPendingApproval: boolean
  /** Whether to show suggestion chips */
  showSuggestions: boolean
  /** Array of suggestion chips to display */
  suggestions?: Suggestion[]
}

const props = withDefaults(defineProps<Props>(), {
  suggestions: () => []
})

const emit = defineEmits<{
  /** Emitted when user sends a message */
  send: [message: string]
  /** Emitted when user clears the error */
  clearError: []
}>()

// Local state
const inputMessage = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Computed
const isInputDisabled = computed(() => props.hasPendingApproval)

const isSendDisabled = computed(() => {
  return !inputMessage.value.trim() || props.isLoading || props.hasPendingApproval
})

const placeholderText = computed(() => {
  if (props.hasPendingApproval) {
    return 'Please resolve the pending action first...'
  }
  return 'Ask me anything about your restaurant operations...'
})

const inputClasses = computed(() => {
  const base = [
    'w-full',
    'px-4',
    'py-3',
    'pr-28',
    'border',
    'border-gray-300',
    'dark:border-gray-600',
    'rounded-xl',
    'resize-none',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:border-transparent',
    'dark:bg-gray-700',
    'dark:text-white'
  ]

  if (props.hasPendingApproval) {
    base.push('opacity-50', 'cursor-not-allowed')
  }

  return base.join(' ')
})

// Auto-resize textarea
watch(inputMessage, async () => {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight
    // Clamp between minHeight (48px) and maxHeight (120px)
    const newHeight = Math.min(Math.max(scrollHeight, 48), 120)
    textareaRef.value.style.height = `${newHeight}px`
  }
})

// Methods
function handleKeyPress(event: KeyboardEvent) {
  // Send on Enter (without Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleSend() {
  const message = inputMessage.value.trim()
  if (message && !props.isLoading && !props.hasPendingApproval) {
    emit('send', message)
    inputMessage.value = ''
  }
}

function handleSuggestionClick(query: string) {
  emit('send', query)
}

function handleClearError() {
  emit('clearError')
}
</script>

<template>
  <div class="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
    <!-- Connection Status -->
    <div class="flex items-center gap-2 mb-2">
      <span
        v-if="isConnected"
        class="flex items-center text-xs text-green-600 dark:text-green-400"
      >
        <Wifi class="w-3 h-3 mr-1" />
        Connected
      </span>
      <span v-else class="flex items-center text-xs text-gray-400">
        <WifiOff class="w-3 h-3 mr-1" />
        Disconnected
      </span>
    </div>

    <!-- Error Message Display -->
    <div
      v-if="error"
      class="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between"
    >
      <span class="text-sm text-red-700 dark:text-red-400">{{ error }}</span>
      <button
        type="button"
        class="text-red-500 hover:text-red-700 dark:hover:text-red-300"
        @click="handleClearError"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Pending Approval Notice -->
    <div
      v-if="hasPendingApproval"
      class="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
    >
      <span class="text-sm text-amber-700 dark:text-amber-400">
        Please approve or reject the pending action before sending new messages.
      </span>
    </div>

    <!-- Suggestion Chips for New Chats -->
    <div v-if="showSuggestions && !hasPendingApproval && suggestions.length > 0" class="mb-4">
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          type="button"
          class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 rounded-full border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          @click="handleSuggestionClick(suggestion.query)"
        >
          {{ suggestion.label }}
        </button>
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex space-x-4">
      <div class="flex-1">
        <div class="relative">
          <textarea
            ref="textareaRef"
            v-model="inputMessage"
            :placeholder="placeholderText"
            :class="inputClasses"
            :disabled="isInputDisabled"
            rows="1"
            :style="{ minHeight: '48px', maxHeight: '120px' }"
            @keypress="handleKeyPress"
          />

          <!-- Enter to send hint -->
          <div
            v-if="!inputMessage && !hasPendingApproval"
            class="absolute bottom-3.5 right-20 text-xs text-gray-400 dark:text-gray-500 pointer-events-none hidden sm:block"
          >
            <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-[10px]">Enter</kbd>
            to send
          </div>

          <!-- Attachment and Mic buttons -->
          <div class="absolute right-3 bottom-3 flex space-x-2">
            <button
              type="button"
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isInputDisabled"
            >
              <Paperclip class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isInputDisabled"
            >
              <Mic class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Send Button -->
      <button
        type="button"
        class="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSendDisabled"
        @click="handleSend"
      >
        <Send class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
