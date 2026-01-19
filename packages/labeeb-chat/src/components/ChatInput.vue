<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Send, Mic, Paperclip, X, AlertCircle } from 'lucide-vue-next'

interface Suggestion {
  label: string
  query: string
}

interface Props {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  hasPendingApproval: boolean
  showSuggestions: boolean
  suggestions?: Suggestion[]
}

const props = withDefaults(defineProps<Props>(), {
  suggestions: () => []
})

const emit = defineEmits<{
  send: [message: string]
  clearError: []
}>()

const inputMessage = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

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

watch(inputMessage, async () => {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight
    const newHeight = Math.min(Math.max(scrollHeight, 48), 120)
    textareaRef.value.style.height = `${newHeight}px`
  }
})

function handleKeyPress(event: KeyboardEvent) {
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
  <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
    <!-- Connection Status (subtle, inline) -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span
          :class="[
            'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full',
            isConnected
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            ]"
          />
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>

    <!-- Error Message (dismissible toast style) -->
    <div
      v-if="error"
      class="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between"
    >
      <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
        <AlertCircle class="w-4 h-4 flex-shrink-0" />
        <span class="text-sm">{{ error }}</span>
      </div>
      <button
        class="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
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
      <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <AlertCircle class="w-4 h-4 flex-shrink-0" />
        <span class="text-sm">Please approve or reject the pending action before sending new messages.</span>
      </div>
    </div>

    <!-- Suggestion Chips (horizontal scroll) -->
    <div v-if="showSuggestions && !hasPendingApproval && suggestions.length > 0" class="mb-3">
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
      <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="flex-shrink-0 px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors whitespace-nowrap"
          @click="handleSuggestionClick(suggestion.query)"
        >
          {{ suggestion.label }}
        </button>
      </div>
    </div>

    <!-- Input Area (card style) -->
    <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
      <div class="flex items-end gap-3">
        <!-- Left action buttons -->
        <div class="flex gap-1 pb-1">
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            :disabled="isInputDisabled"
            title="Attach file"
          >
            <Paperclip class="w-5 h-5" />
          </button>
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            :disabled="isInputDisabled"
            title="Voice input"
          >
            <Mic class="w-5 h-5" />
          </button>
        </div>

        <!-- Textarea -->
        <div class="flex-1 relative">
          <textarea
            ref="textareaRef"
            v-model="inputMessage"
            :placeholder="placeholderText"
            :disabled="isInputDisabled"
            rows="1"
            class="w-full px-0 py-2 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :style="{ minHeight: '40px', maxHeight: '120px', overflow: 'hidden' }"
            @keypress="handleKeyPress"
          />
          <!-- Enter hint -->
          <div
            v-if="!inputMessage && !hasPendingApproval"
            class="absolute bottom-2.5 right-0 text-xs text-gray-400 pointer-events-none hidden sm:block"
          >
            <kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-medium">Enter</kbd>
            to send
          </div>
        </div>

        <!-- Send button -->
        <button
          :disabled="isSendDisabled"
          class="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600"
          @click="handleSend"
        >
          <Send class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
