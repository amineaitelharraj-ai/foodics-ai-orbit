<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, ModifierPreview, Price } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { Settings, Package } from 'lucide-vue-next';

export interface ModifierCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<ModifierCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const modifierPreview = computed(() => props.preview as ModifierPreview);
const modifier = computed(() => modifierPreview.value.modifier);
const product = computed(() => modifierPreview.value.product);

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
      <!-- Modifier Icon -->
      <div
        class="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400"
      >
        <Settings :size="24" />
      </div>

      <!-- Modifier Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ modifier.name }}
        </h4>
        <p v-if="modifier.reference" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Ref: {{ modifier.reference }}
        </p>
        <p v-if="modifier.price" class="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">
          {{ formatPrice(modifier.price) }}
        </p>
        <div class="mt-2">
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              modifier.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            {{ modifier.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Product Info (for attach/detach operations) -->
    <div v-if="product" class="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
        <Package :size="12" />
        Product
      </p>
      <span class="text-sm text-gray-700 dark:text-gray-300">{{ product.name || product.id }}</span>
    </div>
  </HITLCardWrapper>
</template>
