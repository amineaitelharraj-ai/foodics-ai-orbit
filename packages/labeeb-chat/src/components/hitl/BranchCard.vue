<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, BranchPreview } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { Building2, Phone, MapPin } from 'lucide-vue-next';

export interface BranchCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<BranchCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const branchPreview = computed(() => props.preview as BranchPreview);
const branch = computed(() => branchPreview.value.branch);
</script>

<template>
  <HITLCardWrapper
    :preview="preview"
    :status="status"
    @approve="emit('approve')"
    @reject="(reason) => emit('reject', reason)"
  >
    <div class="flex items-start gap-3">
      <!-- Branch Icon -->
      <div
        class="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
      >
        <Building2 :size="24" />
      </div>

      <!-- Branch Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ branch.name }}
        </h4>

        <div class="space-y-1 mt-2">
          <p v-if="branch.phone" class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Phone :size="14" class="text-gray-400" />
            {{ branch.phone }}
          </p>
          <p v-if="branch.address" class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <MapPin :size="14" class="text-gray-400" />
            {{ branch.address }}
          </p>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <span v-if="branch.reference" class="text-xs text-gray-500 dark:text-gray-400">
            Ref: {{ branch.reference }}
          </span>
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              branch.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            ]"
          >
            {{ branch.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>
  </HITLCardWrapper>
</template>
