<script setup lang="ts">
import { ref, computed } from 'vue';
import type { HITLPreview, HITLStatus, ProductPreview, Price } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { ImageIcon, Camera } from 'lucide-vue-next';

export interface ProductCardProps {
  preview: HITLPreview;
  status: HITLStatus;
  generatedImageUrl?: string;
}

const props = defineProps<ProductCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
  generateImage: [];
}>();

const productPreview = computed(() => props.preview as ProductPreview);
const product = computed(() => productPreview.value.product);
const comboOptions = computed(() => productPreview.value.combo_options || []);
const modifiers = computed(() => productPreview.value.modifiers || []);
const imageUrl = computed(() => props.generatedImageUrl || product.value.image_url);

const generating = ref(false);
const error = ref<string | null>(null);

function formatPrice(price?: Price): string {
  if (!price) return '';
  return `${price.currency} ${price.amount.toLocaleString()}`;
}

async function handleGenerateImage() {
  generating.value = true;
  error.value = null;
  try {
    emit('generateImage');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate image';
  } finally {
    generating.value = false;
  }
}
</script>

<template>
  <HITLCardWrapper
    :preview="preview"
    :status="status"
    @approve="emit('approve')"
    @reject="(reason) => emit('reject', reason)"
  >
    <div class="flex gap-4">
      <!-- Product Image -->
      <div class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
          <template v-if="status === 'pending'">
            <button
              :disabled="generating"
              class="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              @click="handleGenerateImage"
            >
              <span v-if="generating" class="animate-spin">⏳</span>
              <Camera v-else :size="12" />
              <span>{{ generating ? '...' : 'Generate' }}</span>
            </button>
            <span v-if="error" class="text-xs text-red-500 text-center">{{ error }}</span>
          </template>
          <div v-else class="text-gray-400 dark:text-gray-500">
            <ImageIcon :size="32" />
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ product.name }}
        </h4>
        <p v-if="product.category" class="text-sm text-gray-500 dark:text-gray-400">
          {{ product.category.name }}
        </p>
        <p v-if="product.price" class="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">
          {{ formatPrice(product.price) }}
        </p>
        <p v-if="product.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
          {{ product.description }}
        </p>
      </div>
    </div>

    <!-- Combo Options -->
    <div v-if="comboOptions.length > 0" class="mt-3">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Combo Options</p>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="(option, i) in comboOptions"
          :key="i"
          class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
        >
          {{ option.name }}
        </span>
      </div>
    </div>

    <!-- Modifiers -->
    <div v-if="modifiers.length > 0" class="mt-3">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Modifiers</p>
      <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-0.5">
        <li v-for="(mod, i) in modifiers" :key="i" class="flex items-center gap-1">
          <span class="text-gray-400">•</span>
          <span>{{ mod.name }}</span>
          <span v-if="mod.price_delta" class="text-green-600 dark:text-green-400">
            (+{{ formatPrice(mod.price_delta) }})
          </span>
        </li>
      </ul>
    </div>

    <!-- SKU -->
    <div v-if="product.sku" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
      SKU: {{ product.sku }}
    </div>
  </HITLCardWrapper>
</template>
