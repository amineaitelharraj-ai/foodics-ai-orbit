<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, PromotionPreview, Price } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { Percent, Package, FolderOpen, Calendar } from 'lucide-vue-next';

export interface PromotionCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<PromotionCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const promoPreview = computed(() => props.preview as PromotionPreview);
const promotion = computed(() => promoPreview.value.promotion);
const product = computed(() => promoPreview.value.product);
const category = computed(() => promoPreview.value.category);
const schedule = computed(() => promoPreview.value.schedule);

function formatPrice(price?: Price): string {
  if (!price) return '';
  return `${price.currency} ${price.amount.toLocaleString()}`;
}

const discountDisplay = computed(() => {
  if (!promotion.value.discount_value) return null;
  if (promotion.value.discount_type === 'percentage') {
    return `${promotion.value.discount_value}%`;
  }
  return promotion.value.discount_value;
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
      <!-- Promotion Icon -->
      <div
        class="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"
      >
        <Percent :size="24" />
      </div>

      <!-- Promotion Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ promotion.name || 'Promotion' }}
        </h4>
        <p v-if="promotion.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {{ promotion.description }}
        </p>

        <!-- Discount Display -->
        <div v-if="discountDisplay" class="flex items-center gap-2 mt-2">
          <span class="text-xl font-bold text-rose-600 dark:text-rose-400">
            {{ discountDisplay }} OFF
          </span>
        </div>

        <div class="mt-2">
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              promotion.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            {{ promotion.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Product Info (for add_product/remove_product) -->
    <div v-if="product" class="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
        <Package :size="12" />
        Product
      </p>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ product.name || product.id }}</span>
        <span v-if="product.price" class="text-sm font-medium text-primary-600 dark:text-primary-400">
          {{ formatPrice(product.price) }}
        </span>
      </div>
    </div>

    <!-- Category Info (for add_category/remove_category) -->
    <div v-if="category" class="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
        <FolderOpen :size="12" />
        Category
      </p>
      <span class="text-sm text-gray-700 dark:text-gray-300">{{ category.name || category.id }}</span>
    </div>

    <!-- Schedule (for extend operation) -->
    <div v-if="schedule" class="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <p class="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
        <Calendar :size="12" />
        Schedule Extension
      </p>
      <div class="text-sm space-y-1">
        <div v-if="schedule.current_end_date" class="text-gray-600 dark:text-gray-400">
          Current end: {{ schedule.current_end_date }}
        </div>
        <div v-if="schedule.new_end_date" class="text-blue-600 dark:text-blue-400 font-medium">
          New end: {{ schedule.new_end_date }}
        </div>
        <div v-if="schedule.extension_days" class="text-gray-600 dark:text-gray-400">
          +{{ schedule.extension_days }} days
        </div>
      </div>
    </div>
  </HITLCardWrapper>
</template>
