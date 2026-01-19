<script setup lang="ts">
import type { HITLPreview, HITLStatus } from '../../types/hitl-previews';
import { OPERATION_STYLES, STATUS_STYLES, getCompletedStatusText } from '../../types/hitl-previews';
import { computed } from 'vue';
import { FdxButton, FdxCard, FdxChip } from '@foodics/ui-common';

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

const chipColor = computed(() => {
  const colorMap: Record<string, 'success' | 'primary' | 'error' | 'warning' | 'gray'> = {
    green: 'success',
    blue: 'primary',
    red: 'error',
    yellow: 'warning',
    orange: 'warning',
    gray: 'gray',
  };
  const style = operationStyle.value;
  return style ? colorMap[style.color] || 'gray' : 'gray';
});

const statusChipColor = computed(() => {
  return props.status === 'approved' ? 'success' : props.status === 'rejected' ? 'error' : 'warning';
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
        <FdxChip :color="chipColor" variant="soft" size="sm">
          {{ statusText }}
        </FdxChip>
        <FdxChip v-if="status !== 'pending'" :color="statusChipColor" variant="solid" size="sm">
          {{ statusStyle.text }}
        </FdxChip>
      </div>

      <!-- Card Content (slot) -->
      <slot />

      <!-- Action Buttons (only when pending) -->
      <div v-if="status === 'pending'" class="flex gap-3 mt-4 pt-4 border-t border-gray-200">
        <FdxButton variant="outline" color="error" class="flex-1" @click="handleReject">
          Reject
        </FdxButton>
        <FdxButton color="success" class="flex-1" @click="handleApprove">
          Approve
        </FdxButton>
      </div>
    </div>
  </FdxCard>
</template>
