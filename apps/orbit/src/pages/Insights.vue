<script setup lang="ts">
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-vue-next';

const metrics = [
  {
    label: 'Total Revenue',
    value: '$124,560',
    change: '+12.5%',
    positive: true,
    icon: DollarSign,
  },
  {
    label: 'Orders Today',
    value: '342',
    change: '+8.2%',
    positive: true,
    icon: TrendingUp,
  },
  {
    label: 'Active Customers',
    value: '1,247',
    change: '-2.1%',
    positive: false,
    icon: Users,
  },
  {
    label: 'Avg Order Value',
    value: '$36.40',
    change: '+4.3%',
    positive: true,
    icon: BarChart3,
  },
];
</script>

<template>
  <div class="h-full overflow-y-auto p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Business Insights
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Overview of your business performance
        </p>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg"
            >
              <component
                :is="metric.icon"
                class="w-5 h-5 text-primary-600 dark:text-primary-400"
              />
            </div>
            <span
              :class="[
                'text-sm font-medium',
                metric.positive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              ]"
            >
              {{ metric.change }}
            </span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ metric.value }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ metric.label }}
          </div>
        </div>
      </div>

      <!-- Placeholder Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sales Trend
          </h3>
          <div
            class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <p class="text-gray-500 dark:text-gray-400">
              Chart placeholder - Coming soon
            </p>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Products
          </h3>
          <div
            class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <p class="text-gray-500 dark:text-gray-400">
              Chart placeholder - Coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
