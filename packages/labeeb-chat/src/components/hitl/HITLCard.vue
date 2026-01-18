<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import type { HITLPreview, HITLStatus } from '../../types/hitl-previews';

// Lazy load card components
const ProductCard = defineAsyncComponent(() => import('./ProductCard.vue'));
const CategoryCard = defineAsyncComponent(() => import('./CategoryCard.vue'));
const CustomerCard = defineAsyncComponent(() => import('./CustomerCard.vue'));
const PointsCard = defineAsyncComponent(() => import('./PointsCard.vue'));
const LoyaltyProgramCard = defineAsyncComponent(() => import('./LoyaltyProgramCard.vue'));
const LoyaltyRewardCard = defineAsyncComponent(() => import('./LoyaltyRewardCard.vue'));
const PromotionCard = defineAsyncComponent(() => import('./PromotionCard.vue'));
const ComboCard = defineAsyncComponent(() => import('./ComboCard.vue'));
const ModifierCard = defineAsyncComponent(() => import('./ModifierCard.vue'));
const BranchCard = defineAsyncComponent(() => import('./BranchCard.vue'));
const SupplierCard = defineAsyncComponent(() => import('./SupplierCard.vue'));
const InventoryTransactionCard = defineAsyncComponent(() => import('./InventoryTransactionCard.vue'));
const InventoryCountCard = defineAsyncComponent(() => import('./InventoryCountCard.vue'));
const GenericCard = defineAsyncComponent(() => import('./GenericCard.vue'));

export interface HITLCardProps {
  preview: HITLPreview;
  status: HITLStatus;
  generatedImageUrl?: string;
}

const props = defineProps<HITLCardProps>();

const emit = defineEmits<{
  approve: [];
  reject: [reason?: string];
  generateImage: [];
}>();

const CARD_COMPONENTS: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  product_preview: ProductCard,
  category_preview: CategoryCard,
  customer_preview: CustomerCard,
  points_preview: PointsCard,
  loyalty_program_preview: LoyaltyProgramCard,
  loyalty_reward_preview: LoyaltyRewardCard,
  promotion_preview: PromotionCard,
  combo_preview: ComboCard,
  modifier_preview: ModifierCard,
  branch_preview: BranchCard,
  supplier_preview: SupplierCard,
  inventory_transaction_preview: InventoryTransactionCard,
  inventory_count_preview: InventoryCountCard,
};

const CardComponent = computed(() => {
  return CARD_COMPONENTS[props.preview.type] || GenericCard;
});

function handleApprove() {
  emit('approve');
}

function handleReject(reason?: string) {
  emit('reject', reason);
}

function handleGenerateImage() {
  emit('generateImage');
}
</script>

<template>
  <component
    :is="CardComponent"
    :preview="preview"
    :status="status"
    :generated-image-url="generatedImageUrl"
    @approve="handleApprove"
    @reject="handleReject"
    @generate-image="handleGenerateImage"
  />
</template>
