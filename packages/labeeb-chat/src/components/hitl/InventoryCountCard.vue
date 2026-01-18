<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, InventoryCountPreview } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { ClipboardList, Building2, Calendar } from 'lucide-vue-next';

export interface InventoryCountCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<InventoryCountCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const countPreview = computed(() => props.preview as InventoryCountPreview);
const count = computed(() => countPreview.value.count);
const items = computed(() => countPreview.value.items || []);
const branch = computed(() => countPreview.value.branch);
</script>

<template>
  <HITLCardWrapper
    :preview="preview"
    :status="status"
    @approve="emit('approve')"
    @reject="(reason) => emit('reject', reason)"
  >
    <div class="flex items-start gap-3">
      <!-- Count Icon -->
      <div
        class="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"
      >
        <ClipboardList :size="24" />
      </div>

      <!-- Count Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg">
          Inventory Count
        </h4>
        <p v-if="count.reference" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Ref: {{ count.reference }}
        </p>
        <div class="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span v-if="count.date" class="flex items-center gap-1">
            <Calendar :size="14" />
            {{ count.date }}
          </span>
          <span v-if="branch" class="flex items-center gap-1">
            <Building2 :size="14" />
            {{ branch.name || branch.id }}
          </span>
        </div>
      </div>
    </div>

    <!-- Items -->
    <div v-if="items.length > 0" class="mt-3">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Items ({{ items.length }})
      </p>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-between"
        >
          <span class="text-sm text-gray-700 dark:text-gray-300 truncate">
            {{ item.name || item.id }}
          </span>
          <div class="flex items-center gap-3 text-xs">
            <span v-if="item.expected_quantity !== undefined" class="text-gray-500">
              Expected: {{ item.expected_quantity }}
            </span>
            <span
              v-if="item.counted_quantity !== undefined"
              :class="[
                'font-medium',
                item.counted_quantity === item.expected_quantity
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
              ]"
            >
              Counted: {{ item.counted_quantity }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="count.notes" class="mt-3 text-sm text-gray-600 dark:text-gray-400">
      <span class="font-medium">Notes:</span> {{ count.notes }}
    </div>
  </HITLCardWrapper>
</template>
