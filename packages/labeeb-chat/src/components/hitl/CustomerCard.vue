<script setup lang="ts">
import { computed } from 'vue';
import type { HITLPreview, HITLStatus, CustomerPreview, Price } from '../../types/hitl-previews';
import HITLCardWrapper from './HITLCardWrapper.vue';
import { User, Mail, Phone, CreditCard, Tag } from 'lucide-vue-next';

export interface CustomerCardProps {
  preview: HITLPreview;
  status: HITLStatus;
}

const props = defineProps<CustomerCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
}>();

const customerPreview = computed(() => props.preview as CustomerPreview);
const customer = computed(() => customerPreview.value.customer);
const tag = computed(() => customerPreview.value.tag);
const houseAccount = computed(() => customerPreview.value.house_account);

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
      <!-- Customer Avatar -->
      <div
        class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"
      >
        <User :size="24" />
      </div>

      <!-- Customer Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {{ customer.name }}
        </h4>

        <div class="space-y-1 mt-2">
          <p v-if="customer.email" class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Mail :size="14" class="text-gray-400" />
            {{ customer.email }}
          </p>
          <p v-if="customer.phone" class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Phone :size="14" class="text-gray-400" />
            {{ customer.phone }}
          </p>
          <p v-if="customer.loyalty_number" class="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <CreditCard :size="14" class="text-gray-400" />
            {{ customer.loyalty_number }}
          </p>
        </div>

        <!-- Blacklist Status -->
        <div v-if="customer.is_blacklisted !== undefined" class="mt-2">
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              customer.is_blacklisted
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            ]"
          >
            {{ customer.is_blacklisted ? 'Blacklisted' : 'Active' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tag Info (for add_tag/remove_tag operations) -->
    <div v-if="tag" class="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
        <Tag :size="12" />
        Tag
      </p>
      <span class="text-sm text-gray-700 dark:text-gray-300">{{ tag.name }}</span>
    </div>

    <!-- House Account Info -->
    <div v-if="houseAccount" class="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">House Account</p>
      <div class="flex gap-4 text-sm">
        <span v-if="houseAccount.balance" class="text-gray-700 dark:text-gray-300">
          Balance: {{ formatPrice(houseAccount.balance) }}
        </span>
        <span v-if="houseAccount.credit_limit" class="text-gray-700 dark:text-gray-300">
          Limit: {{ formatPrice(houseAccount.credit_limit) }}
        </span>
      </div>
    </div>
  </HITLCardWrapper>
</template>
