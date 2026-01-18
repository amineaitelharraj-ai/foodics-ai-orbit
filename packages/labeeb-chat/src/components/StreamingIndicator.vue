<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';

// =============================================================================
// Types
// =============================================================================

interface ToolStatus {
  toolName: string;
  message: string;
}

interface Props {
  streamingContent: string;
  toolStatus: ToolStatus | null;
  isLoading: boolean;
}

// =============================================================================
// Props
// =============================================================================

const props = defineProps<Props>();

// =============================================================================
// Constants - Waiting Messages
// =============================================================================

const waitingMessages: readonly string[] = [
  'Brewing your Qahwa with extra cardamom...',
  'Slow-cooking your Kabsa to perfection...',
  'Rolling the Sambusas with care...',
  'Layering the Kunafa just right...',
  'Preparing your Mandi underground style...',
  'Selecting the finest Medjool dates...',
  'Spinning the Shawarma spit...',
  'Perfecting the tahini drizzle...',
  'Letting the saffron infuse...',
  'Garnishing with fresh parsley and sumac...',
  'Fluffing the rice grain by grain...',
  'Adding a pinch of bezar spice...',
  'Toasting the pine nuts to golden perfection...',
  'Drizzling the olive oil just right...',
  'Simmering the lentil soup...',
  'Grilling the kofta over charcoal...',
  'Stuffing the grape leaves with love...',
  'Whisking the hummus to silky smoothness...',
  'Baking the manakeesh in a stone oven...',
  'Sprinkling zaatar on fresh bread...',
  'Did you know? Save up to 5% with Foodics Pay Capital!',
  'Tip: Foodics Marketplace has 100+ integrations ready for you!',
  'Pro tip: Use Foodics Analytics to track your best-selling items!',
  'Hint: Foodics Inventory helps reduce waste by up to 30%!',
];

const foodEmojis: readonly string[] = [
  '🍽️',
  '🥘',
  '☕',
  '🧆',
  '🍚',
  '🥙',
  '🍲',
  '🫖',
  '🥗',
  '🧇',
  '🍖',
  '🥮',
  '🍛',
  '🥧',
  '🍜',
];

// =============================================================================
// Helper Functions
// =============================================================================

const getRandomWaitingMessage = (): string => {
  const index = Math.floor(Math.random() * waitingMessages.length);
  return waitingMessages[index] ?? 'Preparing your answer...';
};

const getRandomEmoji = (): string => {
  const index = Math.floor(Math.random() * foodEmojis.length);
  return foodEmojis[index] ?? '🍽️';
};

/**
 * Check if the content appears to be a structured JSON response
 */
const isStructuredResponse = (content: string): boolean => {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      // Not valid JSON yet, could be incomplete
      return trimmed.length > 50 && (trimmed.startsWith('{') || trimmed.startsWith('['));
    }
  }
  return false;
};

// =============================================================================
// Reactive State
// =============================================================================

const waitingMessage = ref(getRandomWaitingMessage());
const foodEmoji = ref(getRandomEmoji());

// =============================================================================
// Computed
// =============================================================================

/**
 * Determine which indicator to show based on priority:
 * 1. Streaming content (highest priority)
 * 2. Tool status
 * 3. Loading state (lowest priority)
 */
const showStreaming = computed(() => Boolean(props.streamingContent));
const showToolStatus = computed(() => !showStreaming.value && props.toolStatus !== null);
const showLoading = computed(
  () => !showStreaming.value && !showToolStatus.value && props.isLoading
);

const isStructured = computed(() => isStructuredResponse(props.streamingContent));

// =============================================================================
// Effects - Rotate waiting messages and emojis
// =============================================================================

watchEffect((onCleanup) => {
  if (showLoading.value) {
    // Update immediately on mount
    waitingMessage.value = getRandomWaitingMessage();
    foodEmoji.value = getRandomEmoji();

    // Then update every 2.5 seconds
    const interval = setInterval(() => {
      waitingMessage.value = getRandomWaitingMessage();
      foodEmoji.value = getRandomEmoji();
    }, 2500);

    onCleanup(() => clearInterval(interval));
  }
});
</script>

<template>
  <!-- Streaming content indicator -->
  <div v-if="showStreaming" class="flex justify-start">
    <div
      class="max-w-3xl px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
    >
      <div class="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
        <!-- Structured response (JSON) processing -->
        <div v-if="isStructured" class="flex items-center gap-2">
          <span class="animate-pulse">Processing response...</span>
        </div>
        <!-- Regular text streaming -->
        <div v-else class="whitespace-pre-wrap">
          {{ streamingContent }}
        </div>
      </div>
      <div class="flex items-center mt-2 text-xs text-gray-500">
        <span
          class="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse mr-2"
        ></span>
        Streaming...
      </div>
    </div>
  </div>

  <!-- Tool status indicator -->
  <div v-else-if="showToolStatus" class="flex justify-start">
    <div
      class="flex items-center gap-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-4 py-3"
    >
      <!-- Spinner SVG -->
      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span class="font-medium">{{ toolStatus?.message }}</span>
    </div>
  </div>

  <!-- Loading state with food emojis -->
  <div v-else-if="showLoading" class="flex justify-start">
    <div
      class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 px-5 py-4 rounded-2xl shadow-sm max-w-md"
    >
      <div class="flex items-center gap-4">
        <!-- Animated spinner with food emoji -->
        <div class="relative w-12 h-12 flex-shrink-0">
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="w-10 h-10 rounded-full border-2 border-amber-300 dark:border-amber-600 border-t-amber-500 dark:border-t-amber-400 animate-spin"
            ></div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center animate-pulse">
            <span class="text-2xl">{{ foodEmoji }}</span>
          </div>
        </div>

        <!-- Message content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-medium text-amber-600 dark:text-amber-400">
              Preparing your answer
            </span>
            <span class="flex gap-0.5">
              <span
                class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                style="animation-delay: 0ms"
              ></span>
              <span
                class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                style="animation-delay: 150ms"
              ></span>
              <span
                class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                style="animation-delay: 300ms"
              ></span>
            </span>
          </div>
          <p class="text-sm text-amber-700 dark:text-amber-300">{{ waitingMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
