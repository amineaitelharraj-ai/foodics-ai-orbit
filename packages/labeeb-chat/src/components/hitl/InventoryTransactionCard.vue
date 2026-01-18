<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, InventoryTransactionPreview } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Package, Building2 } from 'lucide-vue-next';

export interface InventoryTransactionCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<InventoryTransactionCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const txPreview = computed(() => props.preview as InventoryTransactionPreview);
const transaction = computed(() => txPreview.value.transaction);
const item = computed(() => txPreview.value.item);
const quantity = computed(() => txPreview.value.quantity);
const branch = computed(() => txPreview.value.branch);

const isStockIn = computed(() => quantity.value.direction === 'in');

const transactionIcon = computed(() => {
  if (transaction.value.type === 'adjustment') return RefreshCw;
  return isStockIn.value ? ArrowDownToLine : ArrowUpFromLine;
});

const transactionColor = computed(() => {
  if (transaction.value.type === 'adjustment') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
  return isStockIn.value
    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
});
</script>

<template>
  <HITLCardWrapper
    :preview="preview"
    :status="status"
    @approve="emit('approve')"
    @reject="(reason) => emit('reject', reason)"
  >
    <div class="flex items-start gap-3">
      <!-- Transaction Icon -->
      <div
        :class="['w-12 h-12 rounded-lg flex items-center justify-center', transactionColor]"
      >
        <component :is="transactionIcon" :size="24" />
      </div>

      <!-- Transaction Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg">
          Stock {{ transaction.type === 'adjustment' ? 'Adjustment' : isStockIn ? 'In' : 'Out' }}
        </h4>
        <p v-if="transaction.reason" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {{ transaction.reason }}
        </p>
        <p v-if="transaction.reference" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Ref: {{ transaction.reference }}
        </p>
      </div>
    </div>

    <!-- Item Info -->
    <div class="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
      <div class="flex items-center gap-2 mb-2">
        <Package :size="16" class="text-gray-400" />
        <span class="font-medium text-gray-800 dark:text-gray-200">{{ item.name || item.id }}</span>
        <span v-if="item.sku" class="text-xs text-gray-500">({{ item.sku }})</span>
      </div>

      <!-- Quantity Change -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span
            :class="[
              'text-2xl font-bold',
              isStockIn ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ isStockIn ? '+' : '-' }}{{ quantity.amount }}
          </span>
          <span v-if="item.unit" class="text-gray-500">{{ item.unit }}</span>
        </div>
      </div>

      <!-- Stock Levels -->
      <div v-if="quantity.current_stock !== undefined || quantity.new_stock !== undefined" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-500">Current Stock:</span>
          <span class="font-medium text-gray-700 dark:text-gray-300">
            {{ quantity.current_stock ?? 0 }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm mt-1">
          <span class="text-gray-500">New Stock:</span>
          <span :class="['font-medium', isStockIn ? 'text-green-600' : 'text-red-600']">
            {{ quantity.new_stock ?? 0 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Branch Info -->
    <div v-if="branch" class="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
      <Building2 :size="14" />
      <span>{{ branch.name || branch.id }}</span>
    </div>
  </HITLCardWrapper>
</template>
