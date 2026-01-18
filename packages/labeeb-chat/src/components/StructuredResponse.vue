<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  CheckCircle,
  XCircle,
  List,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-vue-next';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Pagination {
  page: number;
  per_page?: number;
  total: number;
  total_pages: number;
}

export interface ChartConfig {
  title?: string;
  x_axis?: string;
  y_axis?: string;
  label_key?: string;
  value_key?: string;
}

export type DisplayType = 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'cards' | 'text';

export interface WriteResult {
  display_type?: DisplayType;
  entity?: string;
  op?: string;
  ok?: boolean;
  note?: string;
  data?: Record<string, unknown>[];
  chart_config?: ChartConfig;
  pagination?: Pagination;
  context?: string | null;
}

export interface StructuredResponseData {
  summary: string;
  agent: string;
  ok: boolean;
  type?: string;
  entity?: string;
  result?: WriteResult[];
}

// ============================================================================
// Props
// ============================================================================

interface Props {
  data: StructuredResponseData;
}

const props = defineProps<Props>();

// ============================================================================
// Constants
// ============================================================================

const CHART_COLORS = ['#5D34FF', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ============================================================================
// Utility Functions
// ============================================================================

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown, key: string): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    if (
      key.includes('price') ||
      key.includes('spent') ||
      key.includes('revenue') ||
      key.includes('cost') ||
      key === 'value'
    ) {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString();
  }
  return String(value);
}

interface ColumnDef {
  key: string;
  label: string;
}

function inferColumns(data: Record<string, unknown>[]): ColumnDef[] {
  if (!data || data.length === 0) return [];

  const firstItem = data[0];
  if (!firstItem) return [];

  const columns: ColumnDef[] = [];
  const preferred = [
    'name',
    'sku',
    'price',
    'status',
    'reference',
    'total_spent',
    'total_orders',
    'revenue',
    'date',
    'orders',
  ];
  const hidden = ['id', 'name_localized', 'created_at', 'updated_at', 'deleted_at'];

  preferred.forEach((key) => {
    if (key in firstItem && !hidden.includes(key)) {
      columns.push({ key, label: formatLabel(key) });
    }
  });

  Object.keys(firstItem).forEach((key) => {
    if (!preferred.includes(key) && !hidden.includes(key) && !columns.find((c) => c.key === key)) {
      columns.push({ key, label: formatLabel(key) });
    }
  });

  return columns.slice(0, 6);
}

// ============================================================================
// Computed Values
// ============================================================================

const agentLabel = computed(() => {
  return props.data.agent === 'menu' ? 'Menu' : 'Analytics';
});

const agentClass = computed(() => {
  return props.data.agent === 'menu'
    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
    : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300';
});

const statusContainerClass = computed(() => {
  return props.data.ok
    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
});

const statusIconClass = computed(() => {
  return props.data.ok
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
});

// ============================================================================
// Table Pagination State (per-result tracking using index as key)
// ============================================================================

const tablePages = ref<Record<number, number>>({});

function getTablePage(index: number): number {
  return tablePages.value[index] ?? 1;
}

function setTablePage(index: number, page: number): void {
  tablePages.value[index] = page;
}

function calculateTotalPages(dataLength: number, itemsPerPage: number): number {
  return Math.ceil(dataLength / itemsPerPage);
}

function getDisplayData(
  data: Record<string, unknown>[],
  page: number,
  itemsPerPage: number
): Record<string, unknown>[] {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return data.slice(start, end);
}

// ============================================================================
// Status Badge Class Helper
// ============================================================================

function getStatusBadgeClass(status: unknown): string {
  if (status === 'active') {
    return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
  }
  if (status === 'deleted') {
    return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
  }
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
}

// ============================================================================
// Chart Configuration Helpers
// ============================================================================

function getChartAxes(
  data: Record<string, unknown>[] | undefined,
  config?: ChartConfig
): { xAxis: string; yAxis: string } {
  const keys = data?.[0] ? Object.keys(data[0]) : [];
  const xAxis = config?.x_axis || keys[0] || 'x';
  const yAxis = config?.y_axis || keys[1] || 'y';
  return { xAxis, yAxis };
}

function getPieChartKeys(
  data: Record<string, unknown>[],
  config?: ChartConfig
): { labelKey: string; valueKey: string } {
  const keys = data[0] ? Object.keys(data[0]) : [];
  const labelKey = config?.label_key || config?.x_axis || keys[0] || 'label';
  const valueKey = config?.value_key || config?.y_axis || keys[1] || 'value';
  return { labelKey, valueKey };
}

// ============================================================================
// Bar Chart Width Helper
// ============================================================================

function getBarWidthPercent(
  data: Record<string, unknown>[] | undefined,
  item: Record<string, unknown>,
  yAxis: string
): number {
  if (!data || data.length === 0) return 0;
  const itemValue = Number(item[yAxis]) || 0;
  const maxValue = Math.max(...data.map((d) => Number(d[yAxis]) || 0), 1);
  return Math.min(100, (itemValue / maxValue) * 100);
}

// ============================================================================
// Metric Card Helpers
// ============================================================================

interface MetricItem {
  metric?: string;
  label?: string;
  value: unknown;
  change?: number;
  period?: string;
}

function asMetricItem(item: Record<string, unknown>): MetricItem {
  return {
    metric: item.metric as string | undefined,
    label: item.label as string | undefined,
    value: item.value,
    change: item.change as number | undefined,
    period: item.period as string | undefined,
  };
}
</script>

<template>
  <div class="space-y-3">
    <!-- Summary Header -->
    <div :class="['flex items-start gap-3 p-3 rounded-lg', statusContainerClass]">
      <div :class="['mt-0.5', statusIconClass]">
        <CheckCircle v-if="data.ok" class="w-5 h-5" />
        <XCircle v-else class="w-5 h-5" />
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <span :class="['text-xs font-medium px-2 py-0.5 rounded', agentClass]">
            {{ agentLabel }}
          </span>
          <span
            v-if="data.type"
            class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
          >
            <List v-if="!data.type || data.type.toUpperCase() === 'LIST'" class="w-4 h-4" />
            <Plus v-else-if="data.type.toUpperCase() === 'CREATE'" class="w-4 h-4" />
            <Pencil v-else-if="data.type.toUpperCase() === 'UPDATE'" class="w-4 h-4" />
            <Trash2 v-else-if="data.type.toUpperCase() === 'DELETE'" class="w-4 h-4" />
            <BarChart3 v-else-if="data.type.toUpperCase() === 'REPORT'" class="w-4 h-4" />
            <List v-else class="w-4 h-4" />
          </span>
        </div>
        <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ data.summary }}</p>
      </div>
    </div>

    <!-- Results -->
    <template v-if="data.result">
      <template v-for="(result, index) in data.result" :key="index">
        <!-- Error Context Display -->
        <div
          v-if="!result.ok && result.context"
          class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        >
          <div class="flex items-start gap-2">
            <AlertCircle class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p class="text-sm text-amber-800 dark:text-amber-200">{{ result.context }}</p>
          </div>
        </div>

        <!-- Table Display -->
        <template v-else-if="(result.display_type || 'table') === 'table'">
          <div
            v-if="result.data && result.data.length > 0"
            class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <!-- Table Title -->
            <div
              v-if="result.note"
              class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
            >
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
                result.note
              }}</span>
            </div>

            <!-- Table Content -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-100 dark:bg-gray-800">
                    <th
                      v-for="col in inferColumns(result.data)"
                      :key="col.key"
                      class="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {{ col.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in getDisplayData(
                      result.data,
                      getTablePage(index),
                      10
                    )"
                    :key="rowIndex"
                    class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td
                      v-for="col in inferColumns(result.data)"
                      :key="col.key"
                      class="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      <span
                        v-if="col.key === 'status'"
                        :class="[
                          'px-2 py-0.5 rounded text-xs font-medium',
                          getStatusBadgeClass(row[col.key]),
                        ]"
                      >
                        {{ row[col.key] }}
                      </span>
                      <template v-else>
                        {{ formatValue(row[col.key], col.key) }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div
              v-if="
                calculateTotalPages(result.data.length, 10) > 1 || result.pagination
              "
              class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
            >
              <span class="text-xs text-gray-500 dark:text-gray-400">
                <template v-if="result.pagination">
                  Page {{ result.pagination.page }} of {{ result.pagination.total_pages }} ({{
                    result.pagination.total
                  }}
                  total)
                </template>
                <template v-else>
                  Showing
                  {{ (getTablePage(index) - 1) * 10 + 1 }}-{{
                    Math.min(getTablePage(index) * 10, result.data.length)
                  }}
                  of {{ result.data.length }}
                </template>
              </span>
              <div class="flex gap-1">
                <button
                  :disabled="getTablePage(index) === 1"
                  class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
                  @click="setTablePage(index, Math.max(1, getTablePage(index) - 1))"
                >
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <button
                  :disabled="
                    getTablePage(index) === calculateTotalPages(result.data.length, 10)
                  "
                  class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
                  @click="
                    setTablePage(
                      index,
                      Math.min(
                        calculateTotalPages(result.data.length, 10),
                        getTablePage(index) + 1
                      )
                    )
                  "
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Line Chart Display -->
        <template v-else-if="result.display_type === 'line_chart'">
          <div
            v-if="result.data && result.data.length > 0"
            class="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <h4
              v-if="result.chart_config?.title"
              class="font-medium text-gray-800 dark:text-gray-200 mb-3"
            >
              {{ result.chart_config.title }}
            </h4>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <BarChart3 class="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Line chart with {{ result.data.length }} data points
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                X: {{ getChartAxes(result.data, result.chart_config).xAxis }} | Y:
                {{ getChartAxes(result.data, result.chart_config).yAxis }}
              </p>
              <!-- Chart data preview as simple table -->
              <div
                v-if="result.data.length <= 10"
                class="mt-3 text-left overflow-x-auto"
              >
                <table class="w-full text-xs">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700">
                      <th class="px-2 py-1 text-gray-600 dark:text-gray-400">
                        {{ getChartAxes(result.data, result.chart_config).xAxis }}
                      </th>
                      <th class="px-2 py-1 text-gray-600 dark:text-gray-400">
                        {{ getChartAxes(result.data, result.chart_config).yAxis }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(point, pointIndex) in result.data"
                      :key="pointIndex"
                      class="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td class="px-2 py-1 text-gray-700 dark:text-gray-300">
                        {{
                          point[getChartAxes(result.data, result.chart_config).xAxis]
                        }}
                      </td>
                      <td class="px-2 py-1 text-gray-700 dark:text-gray-300">
                        {{
                          formatValue(
                            point[getChartAxes(result.data, result.chart_config).yAxis],
                            getChartAxes(result.data, result.chart_config).yAxis
                          )
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>

        <!-- Bar Chart Display -->
        <template v-else-if="result.display_type === 'bar_chart'">
          <div
            v-if="result.data && result.data.length > 0"
            class="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <h4
              v-if="result.chart_config?.title"
              class="font-medium text-gray-800 dark:text-gray-200 mb-3"
            >
              {{ result.chart_config.title }}
            </h4>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <BarChart3 class="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Bar chart with {{ result.data.length }} categories
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                X: {{ getChartAxes(result.data, result.chart_config).xAxis }} | Y:
                {{ getChartAxes(result.data, result.chart_config).yAxis }}
              </p>
              <!-- Simple bar representation -->
              <div class="mt-4 space-y-2">
                <div
                  v-for="(item, itemIndex) in result.data.slice(0, 5)"
                  :key="itemIndex"
                  class="flex items-center gap-2"
                >
                  <span
                    class="text-xs text-gray-600 dark:text-gray-400 w-20 truncate text-right"
                  >
                    {{ item[getChartAxes(result.data, result.chart_config).xAxis] }}
                  </span>
                  <div class="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                    <div
                      class="h-full rounded"
                      :style="{
                        width: `${getBarWidthPercent(result.data ?? [], item, getChartAxes(result.data, result.chart_config).yAxis)}%`,
                        backgroundColor: CHART_COLORS[itemIndex % CHART_COLORS.length],
                      }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-600 dark:text-gray-400 w-16">
                    {{
                      formatValue(
                        item[getChartAxes(result.data, result.chart_config).yAxis],
                        getChartAxes(result.data, result.chart_config).yAxis
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Pie Chart Display -->
        <template v-else-if="result.display_type === 'pie_chart'">
          <div
            v-if="result.data && result.data.length > 0"
            class="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <h4
              v-if="result.chart_config?.title"
              class="font-medium text-gray-800 dark:text-gray-200 mb-3"
            >
              {{ result.chart_config.title }}
            </h4>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <!-- Legend style display -->
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="(item, itemIndex) in result.data"
                  :key="itemIndex"
                  class="flex items-center gap-2"
                >
                  <div
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: CHART_COLORS[itemIndex % CHART_COLORS.length] }"
                  ></div>
                  <span class="text-xs text-gray-700 dark:text-gray-300 truncate">
                    {{
                      item[getPieChartKeys(result.data, result.chart_config).labelKey]
                    }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {{
                      formatValue(
                        item[getPieChartKeys(result.data, result.chart_config).valueKey],
                        getPieChartKeys(result.data, result.chart_config).valueKey
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Metric Cards Display -->
        <template v-else-if="result.display_type === 'cards'">
          <div v-if="result.data && result.data.length > 0" class="space-y-3">
            <h4
              v-if="result.note"
              class="font-medium text-gray-800 dark:text-gray-200"
            >
              {{ result.note }}
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="(item, itemIndex) in result.data"
                :key="itemIndex"
                class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50"
              >
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {{ asMetricItem(item).metric || asMetricItem(item).label }}
                </div>
                <div class="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {{
                    typeof asMetricItem(item).value === 'number'
                      ? formatValue(asMetricItem(item).value, 'value')
                      : asMetricItem(item).value
                  }}
                </div>
                <div
                  v-if="asMetricItem(item).change !== undefined"
                  :class="[
                    'flex items-center gap-1 text-xs mt-1',
                    (asMetricItem(item).change ?? 0) >= 0
                      ? 'text-green-600'
                      : 'text-red-600',
                  ]"
                >
                  <TrendingUp
                    v-if="(asMetricItem(item).change ?? 0) >= 0"
                    class="w-3 h-3"
                  />
                  <TrendingDown v-else class="w-3 h-3" />
                  {{ (asMetricItem(item).change ?? 0) >= 0 ? '+' : ''
                  }}{{ asMetricItem(item).change }}%
                  <span
                    v-if="asMetricItem(item).period"
                    class="text-gray-400 ml-1"
                  >
                    {{ asMetricItem(item).period }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Text Display -->
        <template v-else>
          <div
            v-if="result.note"
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <CheckCircle class="w-4 h-4 text-green-600 dark:text-green-400" />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ result.note }}</span>
          </div>
        </template>
      </template>
    </template>
  </div>
</template>
