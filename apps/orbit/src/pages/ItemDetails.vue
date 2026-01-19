<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();

const item = {
  name: 'YGoussef',
  sku: 'sk-0751',
  minLevel: '-',
  maxLevel: '-',
  ingredientUnit: 'Unit',
  costingMethod: 'From Transactions',
  totalCost: '₦ 0',
  nameLocalized: '-',
  barcode: '-',
  parLevel: '-',
  storageUnit: 'Unit',
  factor: '1 Unit = 1 Unit',
  category: '-',
};

const goBack = () => {
  router.back();
};

const handleEdit = () => {
  router.push('/console/item-details');
};
</script>

<template>
  <div class="p-8 max-w-5xl mx-auto">
    <button
      class="mb-4 p-0 h-auto text-blue-600 hover:text-blue-800 flex items-center gap-1"
      @click="goBack"
    >
      <ArrowLeft class="w-4 h-4" />
      Back
    </button>

    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ item.name }}</h1>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div>
              <div class="text-gray-500 text-sm mb-1">Name</div>
              <div class="font-bold text-lg text-gray-900 dark:text-white">{{ item.name }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">SKU</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ item.sku }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Minimum Level</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ item.minLevel }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Maximum Level</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ item.maxLevel }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Ingredient Unit</div>
              <div class="font-bold text-gray-900 dark:text-white">{{ item.ingredientUnit }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Costing Method</div>
              <div class="font-bold text-gray-900 dark:text-white">{{ item.costingMethod }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Total Cost of Production</div>
              <div class="font-bold text-lg text-gray-900 dark:text-white">{{ item.totalCost }}</div>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <div class="text-gray-500 text-sm mb-1">Name Localized</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ item.nameLocalized }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Barcode</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ item.barcode }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Par Level</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ item.parLevel }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Storage Unit</div>
              <div class="font-bold text-gray-900 dark:text-white">{{ item.storageUnit }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Factor</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ item.factor }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-sm mb-1">Category</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ item.category }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="handleEdit"
      >
        Edit Item
      </button>
    </div>
  </div>
</template>
