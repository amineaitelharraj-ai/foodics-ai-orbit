<script setup lang="ts">
import type { HITLPreview, HITLStatus } from '../../types/hitl-previews';
import { OPERATION_STYLES, STATUS_STYLES, getCompletedStatusText } from '../../types/hitl-previews';
import { computed } from 'vue';

export interface HITLCardWrapperProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<HITLCardWrapperProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const operationStyle = computed(() =>
  OPERATION_STYLES[props.preview.operation] || OPERATION_STYLES.create
);

const statusStyle = computed(() => STATUS_STYLES[props.status]);

const statusBorderColor = computed(() => ({
  pending: 'border-amber-300 dark:border-amber-600',
  approved: 'border-green-300 dark:border-green-600',
  rejected: 'border-red-300 dark:border-red-600',
}[props.status]));

const statusBgColor = computed(() => ({
  pending: 'bg-amber-50 dark:bg-amber-900/20',
  approved: 'bg-green-50 dark:bg-green-900/20',
  rejected: 'bg-red-50 dark:bg-red-900/20',
}[props.status]));

const operationColorClasses = computed(() => {
  const colorMap: Record<string, string> = {
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    orange: 'text-orange-600 dark:text-orange-400',
    gray: 'text-gray-600 dark:text-gray-400',
  };
  const style = operationStyle.value;
  return style ? colorMap[style.color] || 'text-gray-600' : 'text-gray-600';
});

const statusText = computed(() => {
  const style = operationStyle.value;
  return props.status === 'pending'
    ? (style?.statusText ?? 'Processing...')
    : getCompletedStatusText(props.preview.operation);
});

function handleApprove() {
  emit('approve');
}

function handleReject() {
  emit('reject');
}
</script>

<template>
  <div
    :class="[
      'rounded-xl border-2 overflow-hidden transition-all duration-300',
      statusBorderColor,
      statusBgColor
    ]"
  >
    <div class="p-4">
      <!-- Header with operation status -->
      <div class="flex items-center justify-between mb-3">
        <span
          :class="[
            'text-xs font-medium px-2 py-1 rounded-full bg-white dark:bg-gray-800',
            operationColorClasses
          ]"
        >
          {{ statusText }}
        </span>
        <span
          v-if="status !== 'pending'"
          :class="[
            'text-xs font-semibold px-2 py-1 rounded-full',
            status === 'approved'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          ]"
        >
          {{ statusStyle.text }}
        </span>
      </div>

      <!-- Card Content (slot) -->
      <slot />

      <!-- Action Buttons (only when pending) -->
      <div
        v-if="status === 'pending'"
        class="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          class="flex-1 px-4 py-2.5 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30
                 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
          @click="handleReject"
        >
          Reject
        </button>
        <button
          class="flex-1 px-4 py-2.5 text-white bg-green-600
                 rounded-lg hover:bg-green-700 transition-colors font-medium"
          @click="handleApprove"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
</template>
