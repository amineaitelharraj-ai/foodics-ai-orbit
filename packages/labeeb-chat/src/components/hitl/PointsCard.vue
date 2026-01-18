<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, PointsPreview } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { Star, ArrowUp, ArrowDown, User } from 'lucide-vue-next';

export interface PointsCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<PointsCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const pointsPreview = computed(() => props.preview as PointsPreview);
const customer = computed(() => pointsPreview.value.customer);
const points = computed(() => pointsPreview.value.points);
const action = computed(() => pointsPreview.value.action);
const reason = computed(() => pointsPreview.value.reason);

const isAward = computed(() => action.value === 'award');
</script>

<template>
  <HITLCardWrapper
    :preview="preview"
    :status="status"
    @approve="emit('approve')"
    @reject="(r) => emit('reject', r)"
  >
    <div class="flex items-start gap-3">
      <!-- Points Icon -->
      <div
        :class="[
          'w-12 h-12 rounded-full flex items-center justify-center',
          isAward
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
        ]"
      >
        <Star :size="24" />
      </div>

      <!-- Points Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg">
          {{ isAward ? 'Award Points' : 'Redeem Points' }}
        </h4>

        <!-- Customer Info -->
        <div class="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-300">
          <User :size="14" class="text-gray-400" />
          <span>{{ customer.name }}</span>
          <span v-if="customer.loyalty_number" class="text-gray-400">
            ({{ customer.loyalty_number }})
          </span>
        </div>
      </div>
    </div>

    <!-- Points Details -->
    <div class="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <component
            :is="isAward ? ArrowUp : ArrowDown"
            :size="20"
            :class="isAward ? 'text-green-500' : 'text-orange-500'"
          />
          <span class="text-2xl font-bold" :class="isAward ? 'text-green-600' : 'text-orange-600'">
            {{ isAward ? '+' : '-' }}{{ points.amount.toLocaleString() }}
          </span>
          <span class="text-gray-500">points</span>
        </div>
      </div>

      <!-- Balance Change -->
      <div v-if="points.current_balance !== undefined || points.new_balance !== undefined" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-500">Current Balance:</span>
          <span class="font-medium text-gray-700 dark:text-gray-300">
            {{ (points.current_balance ?? 0).toLocaleString() }} pts
          </span>
        </div>
        <div class="flex items-center justify-between text-sm mt-1">
          <span class="text-gray-500">New Balance:</span>
          <span class="font-medium" :class="isAward ? 'text-green-600' : 'text-orange-600'">
            {{ (points.new_balance ?? 0).toLocaleString() }} pts
          </span>
        </div>
      </div>
    </div>

    <!-- Reason -->
    <div v-if="reason" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      <span class="font-medium">Reason:</span> {{ reason }}
    </div>
  </HITLCardWrapper>
</template>
