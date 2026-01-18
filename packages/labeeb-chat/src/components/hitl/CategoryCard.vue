<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, CategoryPreview } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { FolderOpen } from 'lucide-vue-next';

export interface CategoryCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<CategoryCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const categoryPreview = computed(() => props.preview as CategoryPreview);
const category = computed(() => categoryPreview.value.category);

const colorStyle = computed(() => {
  if (category.value.color) {
    return { backgroundColor: category.value.color };
  }
  return undefined;
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
      <!-- Category Icon/Color -->
      <div
        class="w-12 h-12 rounded-lg flex items-center justify-center"
        :class="category.color ? '' : 'bg-purple-100 dark:bg-purple-900/30'"
        :style="colorStyle"
      >
        <FolderOpen
          :size="24"
          :class="category.color ? 'text-white' : 'text-purple-600 dark:text-purple-400'"
        />
      </div>

      <!-- Category Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ category.name }}
        </h4>
        <p v-if="category.parent" class="text-sm text-gray-500 dark:text-gray-400">
          Parent: {{ category.parent.name || category.parent.id }}
        </p>
        <p v-if="category.reference" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Ref: {{ category.reference }}
        </p>
        <div class="flex items-center gap-2 mt-2">
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              category.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            {{ category.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>
  </HITLCardWrapper>
</template>
