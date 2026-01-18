<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, LoyaltyProgramPreview, Price } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { Award, Calendar } from 'lucide-vue-next';

export interface LoyaltyProgramCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<LoyaltyProgramCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const programPreview = computed(() => props.preview as LoyaltyProgramPreview);
const program = computed(() => programPreview.value.program);
const pointsConfig = computed(() => programPreview.value.points_config);
const expiration = computed(() => programPreview.value.expiration);

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
      <!-- Program Icon -->
      <div
        class="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"
      >
        <Award :size="24" />
      </div>

      <!-- Program Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ program.name }}
        </h4>
        <p v-if="program.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {{ program.description }}
        </p>
        <div class="mt-2">
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              program.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            {{ program.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Points Configuration -->
    <div v-if="pointsConfig" class="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Points Configuration</p>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div v-if="pointsConfig.points_per_currency">
          <span class="text-gray-500">Points/Currency:</span>
          <span class="ml-1 font-medium text-gray-700 dark:text-gray-300">
            {{ pointsConfig.points_per_currency }}
          </span>
        </div>
        <div v-if="pointsConfig.currency_per_point">
          <span class="text-gray-500">Currency/Point:</span>
          <span class="ml-1 font-medium text-gray-700 dark:text-gray-300">
            {{ pointsConfig.currency_per_point }}
          </span>
        </div>
        <div v-if="pointsConfig.min_spend">
          <span class="text-gray-500">Min Spend:</span>
          <span class="ml-1 font-medium text-gray-700 dark:text-gray-300">
            {{ formatPrice(pointsConfig.min_spend) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Expiration -->
    <div v-if="expiration" class="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
      <Calendar :size="14" />
      <span v-if="expiration.days">Expires in {{ expiration.days }} days</span>
      <span v-else-if="expiration.date">Expires: {{ expiration.date }}</span>
    </div>
  </HITLCardWrapper>
</template>
