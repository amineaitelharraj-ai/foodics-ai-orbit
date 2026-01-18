<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, ComboPreview, Price } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { Layers, Package, Settings } from 'lucide-vue-next';

export interface ComboCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<ComboCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const comboPreview = computed(() => props.preview as ComboPreview);
const combo = computed(() => comboPreview.value.combo);
const product = computed(() => comboPreview.value.product);
const modifier = computed(() => comboPreview.value.modifier);

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
      <!-- Combo Icon -->
      <div
        class="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400"
      >
        <Layers :size="24" />
      </div>

      <!-- Combo Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ combo.name || 'Combo' }}
        </h4>
        <p v-if="combo.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {{ combo.description }}
        </p>
        <p v-if="combo.price" class="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">
          {{ formatPrice(combo.price) }}
        </p>
        <div class="mt-2">
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              combo.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            {{ combo.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Product Info (for add_product/remove_product/update_product) -->
    <div v-if="product" class="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
        <Package :size="12" />
        Product
      </p>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ product.name || product.id }}</span>
        <div class="flex items-center gap-2">
          <span v-if="product.quantity" class="text-xs text-gray-500">
            Qty: {{ product.quantity }}
          </span>
          <span v-if="product.price" class="text-sm font-medium text-primary-600 dark:text-primary-400">
            {{ formatPrice(product.price) }}
          </span>
        </div>
      </div>
      <span
        v-if="product.is_required !== undefined"
        :class="[
          'text-xs px-2 py-0.5 rounded-full mt-1 inline-block',
          product.is_required
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        ]"
      >
        {{ product.is_required ? 'Required' : 'Optional' }}
      </span>
    </div>

    <!-- Modifier Info (for add_modifier/remove_modifier) -->
    <div v-if="modifier" class="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
        <Settings :size="12" />
        Modifier
      </p>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ modifier.name || modifier.id }}</span>
        <span v-if="modifier.price" class="text-sm font-medium text-primary-600 dark:text-primary-400">
          {{ formatPrice(modifier.price) }}
        </span>
      </div>
    </div>
  </HITLCardWrapper>
</template>
