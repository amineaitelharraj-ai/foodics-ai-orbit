<script setup lang="ts">
import type { HITLPreview, HITLStatus } from '../../types/hitl-previews';
import { OPERATION_STYLES, STATUS_STYLES, getCompletedStatusText } from '../../types/hitl-previews';
import { computed } from 'vue';
import { FdxButton, FdxCard } from '@foodics/ui-common';

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

const chipClass = computed(() => {
  const colorMap: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-amber-100 text-amber-700',
    orange: 'bg-orange-100 text-orange-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  const style = operationStyle.value;
  return style ? colorMap[style.color] || colorMap['gray'] : colorMap['gray'];
});

const statusChipClass = computed(() => {
  return props.status === 'approved'
    ? 'bg-green-100 text-green-700'
    : props.status === 'rejected'
    ? 'bg-red-100 text-red-700'
    : 'bg-amber-100 text-amber-700';
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
  <FdxCard
    :class="[
      'overflow-hidden transition-all duration-300 border-2',
      status === 'pending' ? 'border-amber-300' : status === 'approved' ? 'border-green-300' : 'border-red-300'
    ]"
  >
    <div class="p-4">
      <!-- Header with operation status -->
      <div class="flex items-center justify-between mb-3">
        <span :class="['px-2.5 py-1 text-xs font-medium rounded-full', chipClass]">
          {{ statusText }}
        </span>
        <span v-if="status !== 'pending'" :class="['px-2.5 py-1 text-xs font-medium rounded-full', statusChipClass]">
          {{ statusStyle.text }}
        </span>
      </div>

      <!-- Card Content (slot) -->
      <slot />

      <!-- Action Buttons (only when pending) -->
      <div v-if="status === 'pending'" class="flex gap-3 mt-4 pt-4 border-t border-gray-200">
        <button
          class="flex-1 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          @click="handleReject"
        >
          Reject
        </button>
        <FdxButton color="success" class="flex-1" @click="handleApprove">
          Approve
        </FdxButton>
      </div>
    </div>
  </FdxCard>
</template>
