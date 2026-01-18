<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, SupplierPreview, Price } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { Truck, Mail, Phone, MapPin, Package } from 'lucide-vue-next';

export interface SupplierCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<SupplierCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const supplierPreview = computed(() => props.preview as SupplierPreview);
const supplier = computed(() => supplierPreview.value.supplier);
const item = computed(() => supplierPreview.value.item);

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
      <!-- Supplier Icon -->
      <div
        class="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400"
      >
        <Truck :size="24" />
      </div>

      <!-- Supplier Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ supplier.name }}
        </h4>

        <div class="space-y-1 mt-2">
          <p v-if="supplier.code" class="text-xs text-gray-500 dark:text-gray-400">
            Code: {{ supplier.code }}
          </p>
          <p v-if="supplier.email" class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Mail :size="14" class="text-gray-400" />
            {{ supplier.email }}
          </p>
          <p v-if="supplier.phone" class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Phone :size="14" class="text-gray-400" />
            {{ supplier.phone }}
          </p>
          <p v-if="supplier.address" class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <MapPin :size="14" class="text-gray-400" />
            {{ supplier.address }}
          </p>
        </div>

        <div class="mt-2">
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              supplier.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            {{ supplier.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Item Info (for attach/detach operations) -->
    <div v-if="item" class="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
        <Package :size="12" />
        Item
      </p>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.name || item.id }}</span>
        <span v-if="item.price" class="text-sm font-medium text-primary-600 dark:text-primary-400">
          {{ formatPrice(item.price) }}
        </span>
      </div>
    </div>
  </HITLCardWrapper>
</template>
