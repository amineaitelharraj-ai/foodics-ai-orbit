<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();

interface InventoryItem {
  name: string;
  sku: string;
  storageUnit: string;
  enteredQty: number;
  originalQty: number;
  varianceQty: number;
  variancePercent: string;
  varianceCost: string;
}

interface InventoryCountData {
  branch: string;
  creator: string;
  businessDate: string;
  submitter: string;
  createdAt: string;
  totalVarianceCost: string;
  numberOfItems: number;
  status: string;
  items: InventoryItem[];
}

const inventoryCount: InventoryCountData = {
  branch: 'Branch 1 (B01)',
  creator: 'Huda Aiman Aiman',
  businessDate: '2022-02-21',
  submitter: 'Huda Aiman Aiman',
  createdAt: '2022-02-21 02:28pm',
  totalVarianceCost: '₦ -2.5',
  numberOfItems: 1,
  status: 'Closed',
  items: [
    {
      name: 'Sauce',
      sku: 'sk-0007',
      storageUnit: 'L',
      enteredQty: 1,
      originalQty: 2,
      varianceQty: -1,
      variancePercent: '-50%',
      varianceCost: '₦ -2.5',
    },
  ],
};

const goBack = () => {
  router.back();
};

const handlePrint = () => {
  window.print();
};

const handleDuplicate = () => {
  router.push('/console/inventory-count');
};
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto">
    <button
      class="mb-4 p-0 h-auto text-blue-600 hover:text-blue-800 flex items-center gap-1"
      @click="goBack"
    >
      <ArrowLeft class="w-4 h-4" />
      Back
    </button>

    <div class="flex items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory Count (IC-000003)</h1>
      <span
        :class="[
          'px-3 py-1 rounded-full text-sm font-medium',
          inventoryCount.status === 'Closed'
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        ]"
      >
        {{ inventoryCount.status }}
      </span>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
      <div class="p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div>
              <span class="text-gray-500 text-sm block mb-1">Branch</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ inventoryCount.branch }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Creator</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ inventoryCount.creator }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Total Variance Cost</span>
              <div class="font-medium text-lg text-gray-900 dark:text-white">{{ inventoryCount.totalVarianceCost }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Number of Items</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ inventoryCount.numberOfItems }}</div>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <span class="text-gray-500 text-sm block mb-1">Business Date</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ inventoryCount.businessDate }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Submitter</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ inventoryCount.submitter }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Created At</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ inventoryCount.createdAt }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-3 mb-8">
      <button
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        @click="handlePrint"
      >
        Print
      </button>
      <button
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        @click="handleDuplicate"
      >
        Duplicate
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Items</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700">
              <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Name</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">SKU</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Storage Unit</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Entered Quantity</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Original Quantity</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Variance Quantity</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Variance Percent</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Variance Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in inventoryCount.items"
              :key="index"
              class="border-b border-gray-100 dark:border-gray-700"
            >
              <td class="py-3 px-4 font-medium text-gray-900 dark:text-white">{{ item.name }}</td>
              <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.sku }}</td>
              <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.storageUnit }}</td>
              <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.enteredQty }}</td>
              <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.originalQty }}</td>
              <td
                class="py-3 px-4"
                :class="item.varianceQty < 0 ? 'text-red-600' : 'text-green-600'"
              >
                {{ item.varianceQty }}
              </td>
              <td
                class="py-3 px-4"
                :class="item.variancePercent.includes('-') ? 'text-red-600' : 'text-green-600'"
              >
                {{ item.variancePercent }}
              </td>
              <td
                class="py-3 px-4"
                :class="item.varianceCost.includes('-') ? 'text-red-600' : 'text-green-600'"
              >
                {{ item.varianceCost }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
