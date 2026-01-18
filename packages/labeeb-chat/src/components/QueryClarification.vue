<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

export interface SuggestedFilter {
  name: string
  description: string
}

interface Props {
  sessionId: string
  toolName: string
  message: string
  suggestedFilters: readonly SuggestedFilter[] | SuggestedFilter[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  proceed: []
  refine: [refinement: string]
  cancel: []
}>()

const refinement = ref('')

const formatToolName = (name: string): string => {
  return name.replace('Foodics___', '').replace(/_/g, ' ')
}

const handleRefine = (): void => {
  if (refinement.value.trim()) {
    emit('refine', refinement.value)
  }
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl animate-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
          >
            <span class="text-xl">📊</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Quick Question
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatToolName(props.toolName) }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          @click="emit('cancel')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Message -->
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        {{ props.message }}
      </p>

      <!-- Suggested Filters -->
      <div
        v-if="props.suggestedFilters.length > 0"
        class="mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
      >
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          You can filter by:
        </p>
        <ul class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <li
            v-for="filter in props.suggestedFilters"
            :key="filter.name"
            class="flex gap-2"
          >
            <span class="text-amber-500">•</span>
            <span><strong>{{ filter.name }}:</strong> {{ filter.description }}</span>
          </li>
        </ul>
      </div>

      <!-- Refinement Input -->
      <div class="mb-5">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Refine your query (optional):
        </label>
        <textarea
          v-model="refinement"
          placeholder="e.g., only active products, limit to 50, in the burgers category"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
          rows="3"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-2.5 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          @click="emit('proceed')"
        >
          Get All
        </button>
        <button
          type="button"
          :disabled="!refinement.trim()"
          class="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          @click="handleRefine"
        >
          Refine
        </button>
      </div>
    </div>
  </div>
</template>
