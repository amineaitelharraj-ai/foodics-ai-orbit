<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Send, Mic, Paperclip, Wifi, WifiOff } from 'lucide-vue-next'
import { FdxButton, FdxChip, FdxAlert } from '@foodics/ui-common'

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
  <div class="border-t border-gray-200 p-6 bg-white">
    <!-- Connection Status -->
    <div class="flex items-center gap-2 mb-2">
      <span v-if="isConnected" class="flex items-center text-xs text-green-600">
        <Wifi class="w-3 h-3 mr-1" />
        Connected
      </span>
      <span v-else class="flex items-center text-xs text-gray-400">
        <WifiOff class="w-3 h-3 mr-1" />
        Disconnected
      </span>
    </div>

    <!-- Error Message -->
    <FdxAlert v-if="error" variant="error" class="mb-3" closable @close="handleClearError">
      {{ error }}
    </FdxAlert>

    <!-- Pending Approval Notice -->
    <FdxAlert v-if="hasPendingApproval" variant="warning" class="mb-3">
      Please approve or reject the pending action before sending new messages.
    </FdxAlert>

    <!-- Suggestion Chips -->
    <div v-if="showSuggestions && !hasPendingApproval && suggestions.length > 0" class="mb-4">
      <p class="text-xs text-gray-500 mb-2">Try asking:</p>
      <div class="flex flex-wrap gap-2">
        <FdxChip
          v-for="(suggestion, index) in suggestions"
          :key="index"
          variant="outline"
          size="sm"
          clickable
          @click="handleSuggestionClick(suggestion.query)"
        >
          {{ suggestion.label }}
        </FdxChip>
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex gap-4">
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="inputMessage"
          :placeholder="placeholderText"
          :disabled="isInputDisabled"
          rows="1"
          class="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          :style="{ minHeight: '48px', maxHeight: '120px', overflow: 'hidden' }"
          @keypress="handleKeyPress"
        />

        <!-- Enter hint -->
        <div
          v-if="!inputMessage && !hasPendingApproval"
          class="absolute bottom-3.5 right-16 text-xs text-gray-400 pointer-events-none hidden sm:block"
        >
          <kbd class="px-1 py-0.5 bg-gray-100 rounded text-[10px]">Enter</kbd>
          to send
        </div>

        <!-- Action buttons -->
        <div class="absolute right-3 bottom-3 flex gap-1">
          <button
            type="button"
            class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            :disabled="isInputDisabled"
          >
            <Paperclip class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            :disabled="isInputDisabled"
          >
            <Mic class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Send Button -->
      <FdxButton :disabled="isSendDisabled" @click="handleSend">
        <Send class="w-5 h-5" />
      </FdxButton>
    </div>
  </div>
</template>
