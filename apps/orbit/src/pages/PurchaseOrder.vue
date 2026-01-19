<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowLeft, Trash2 } from 'lucide-vue-next';

const router = useRouter();

interface PurchaseOrderItem {
  name: string;
  sku: string;
  available: string;
  cost: string;
  qty: string;
  total: string;
}

interface PurchaseOrderData {
  supplier: string;
  destination: string;
  creator: string;
  createdAt: string;
  deliveryDate: string;
  businessDate: string;
  numberOfItems: number;
  totalCost: string;
  status: string;
  items: PurchaseOrderItem[];
}

const purchaseOrder: PurchaseOrderData = {
  supplier: 'Dana',
  destination: 'Branch 1 (B01)',
  creator: 'Dana Amer',
  createdAt: '2022-09-20 01:30pm',
  deliveryDate: '2022-09-20',
  businessDate: '-',
  numberOfItems: 3,
  totalCost: '₦ 5',
  status: 'Draft',
  items: [
    { name: 'stock product x', sku: 'sk-0032', available: '0 Unit', cost: '₦ 0', qty: '1 Unit', total: '₦ 0' },
    { name: 'Potato', sku: 'sk-0033', available: '6.95 Box', cost: '₦ 0', qty: '1 Box', total: '₦ 0' },
    { name: 'Orange Juice', sku: 'sk-0034', available: '21.99333 Bottle', cost: '₦ 5', qty: '1 Bottle', total: '₦ 5' },
  ],
};

const goBack = () => {
  router.back();
};

const handlePrint = () => {
  window.print();
};

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this purchase order permanently?')) {
    alert('Purchase order deleted');
    router.push('/');
  }
};

const handleEdit = () => {
  router.push('/console/purchase-order');
};

const handleSubmit = () => {
  alert('Purchase order submitted for review');
};

const handleAddItems = () => {
  alert('Add items dialog would open here');
};

const handleEditQuantities = () => {
  alert('Edit quantities dialog would open here');
};

const handleImportItems = () => {
  alert('Import items dialog would open here');
};

const handleDeleteItem = (index: number) => {
  alert(`Delete item at index ${index}`);
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
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Purchase Order</h1>
      <span class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        {{ purchaseOrder.status }}
      </span>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
      <div class="p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div>
              <span class="text-gray-500 text-sm block mb-1">Supplier</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ purchaseOrder.supplier }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Business Date</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ purchaseOrder.businessDate }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Created At</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ purchaseOrder.createdAt }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Purchase Order Total Cost</span>
              <div class="font-medium text-lg text-gray-900 dark:text-white">{{ purchaseOrder.totalCost }}</div>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <span class="text-gray-500 text-sm block mb-1">Destination</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ purchaseOrder.destination }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Creator</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ purchaseOrder.creator }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Delivery Date</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ purchaseOrder.deliveryDate }}</div>
            </div>
            <div>
              <span class="text-gray-500 text-sm block mb-1">Number of Items</span>
              <div class="font-medium text-gray-900 dark:text-white">{{ purchaseOrder.numberOfItems }}</div>
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
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        @click="handleDelete"
      >
        Delete Permanently
      </button>
      <button
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        @click="handleEdit"
      >
        Edit
      </button>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="handleSubmit"
      >
        Submit For Review
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Items</h2>
      </div>
      <div class="p-6">
        <div class="flex gap-3 mb-6">
          <button
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            @click="handleAddItems"
          >
            Add Items
          </button>
          <button
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            @click="handleEditQuantities"
          >
            Edit Quantities & Cost
          </button>
          <button
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            @click="handleImportItems"
          >
            Import Items
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700">
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Name</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">SKU</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Available Quantity</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Cost Per Unit</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Quantity</th>
                <th class="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Total Cost</th>
                <th class="w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in purchaseOrder.items"
                :key="index"
                class="border-b border-gray-100 dark:border-gray-700"
              >
                <td class="py-3 px-4 font-medium text-gray-900 dark:text-white">{{ item.name }}</td>
                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.sku }}</td>
                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.available }}</td>
                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.cost }}</td>
                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">{{ item.qty }}</td>
                <td class="py-3 px-4 font-medium text-gray-900 dark:text-white">{{ item.total }}</td>
                <td class="py-3 px-4 text-center">
                  <button
                    class="p-1 text-red-500 hover:text-red-700 transition-colors"
                    @click="handleDeleteItem(index)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
