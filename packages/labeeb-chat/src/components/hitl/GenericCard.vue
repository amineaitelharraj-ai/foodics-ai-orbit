<script setup lang="ts">
import type { HITLPreview, HITLStatus } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { Info } from 'lucide-vue-next';
import { computed } from 'vue';

export interface GenericCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<GenericCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const displayType = computed(() =>
  props.preview.type.replace('_preview', '').replace(/_/g, ' ')
);

const displayOperation = computed(() =>
  props.preview.operation.replace(/_/g, ' ')
);

const previewJson = computed(() =>
  JSON.stringify(props.preview, null, 2)
);
</script>

<template>
  <HITLCardWrapper
    :preview="preview"
    :status="status"
    @approve="emit('approve')"
    @reject="(reason) => emit('reject', reason)"
  >
    <div class="flex items-start gap-3">
      <div
        class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400"
      >
        <Info :size="20" />
      </div>
      <div class="flex-1">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg capitalize">
          {{ displayType }}
        </h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {{ displayOperation }}
        </p>
      </div>
    </div>

    <div
      class="mt-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-mono text-gray-600 dark:text-gray-300 overflow-x-auto"
    >
      <pre class="whitespace-pre-wrap">{{ previewJson }}</pre>
    </div>
  </HITLCardWrapper>
</template>
