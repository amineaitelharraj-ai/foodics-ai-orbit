<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, LoyaltyRewardPreview, Price } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { Gift, Star } from 'lucide-vue-next';

export interface LoyaltyRewardCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<LoyaltyRewardCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const rewardPreview = computed(() => props.preview as LoyaltyRewardPreview);
const reward = computed(() => rewardPreview.value.reward);
const program = computed(() => rewardPreview.value.program);

function formatPrice(price?: Price): string {
  if (!price) return '';
  return `${price.currency} ${price.amount.toLocaleString()}`;
}
</script>

<template>
  <HITLCardWrapper
    :preview="preview"
    :status="status"
    @approve="emit('approve')"
    @reject="(reason) => emit('reject', reason)"
  >
    <div class="flex items-start gap-3">
      <!-- Reward Icon -->
      <div
        class="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400"
      >
        <Gift :size="24" />
      </div>

      <!-- Reward Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ reward.name }}
        </h4>
        <p v-if="reward.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {{ reward.description }}
        </p>

        <!-- Points Cost -->
        <div class="flex items-center gap-2 mt-2">
          <Star :size="16" class="text-amber-500" />
          <span class="font-bold text-amber-600 dark:text-amber-400">
            {{ reward.points_cost.toLocaleString() }} points
          </span>
        </div>

        <!-- Reward Type & Value -->
        <div class="flex items-center gap-3 mt-2">
          <span class="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {{ reward.reward_type }}
          </span>
          <span v-if="reward.value" class="text-sm font-medium text-primary-600 dark:text-primary-400">
            {{ formatPrice(reward.value) }}
          </span>
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              reward.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            {{ reward.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Program Info -->
    <div v-if="program" class="mt-3 text-sm text-gray-600 dark:text-gray-400">
      <span class="font-medium">Program:</span> {{ program.name || program.id }}
    </div>
  </HITLCardWrapper>
</template>
