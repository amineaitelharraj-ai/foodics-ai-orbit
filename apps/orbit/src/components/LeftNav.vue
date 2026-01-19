<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Package,
  Mic,
  Palette,
} from 'lucide-vue-next';

interface NavItem {
  id: string;
  label: string;
  icon: typeof MessageSquare;
  route: string;
  section?: 'main' | 'tools' | 'system';
}

defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const route = useRoute();
const router = useRouter();

const navItems: NavItem[] = [
  { id: 'assistant', label: 'Assistant', icon: MessageSquare, route: '/assistant', section: 'main' },
  { id: 'insights', label: 'Insights', icon: BarChart3, route: '/insights', section: 'main' },
  { id: 'inventory-guru', label: 'InventoryGuru', icon: Package, route: '/inventory-guru', section: 'tools' },
  { id: 'call-flow', label: 'Say and Serve', icon: Mic, route: '/call-flow', section: 'tools' },
  { id: 'plat-studio', label: 'PlatStudio', icon: Palette, route: '/plat-studio', section: 'tools' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/settings', section: 'system' },
  { id: 'help', label: 'Help', icon: HelpCircle, route: '/help', section: 'system' },
];

const mainItems = computed(() => navItems.filter((item) => item.section === 'main'));
const toolItems = computed(() => navItems.filter((item) => item.section === 'tools'));
const systemItems = computed(() => navItems.filter((item) => item.section === 'system'));

const currentRoute = computed(() => route.path);

function navigate(path: string) {
  router.push(path);
}

function isActive(itemRoute: string): boolean {
  return currentRoute.value === itemRoute || currentRoute.value.startsWith(itemRoute + '/');
}
</script>

<template>
  <nav
    :class="[
      'h-full bg-gray-900 text-white flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-56'
    ]"
  >
    <!-- Logo -->
    <div class="p-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary-600 rounded-xl">
          <Zap class="w-5 h-5 text-white" />
        </div>
        <span
          v-if="!collapsed"
          class="font-bold text-lg"
        >
          Orbit
        </span>
      </div>
    </div>

    <!-- Main Navigation -->
    <div class="flex-1 py-2 px-2 space-y-6 overflow-y-auto">
      <!-- Main Section -->
      <div class="space-y-1">
        <button
          v-for="item in mainItems"
          :key="item.id"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            isActive(item.route)
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          ]"
          :title="collapsed ? item.label : undefined"
          @click="navigate(item.route)"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="!collapsed" class="text-sm font-medium">{{ item.label }}</span>
        </button>
      </div>

      <!-- Tools Section -->
      <div v-if="toolItems.length" class="space-y-1">
        <p v-if="!collapsed" class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Tools
        </p>
        <div v-else class="border-t border-gray-700 my-2" />
        <button
          v-for="item in toolItems"
          :key="item.id"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            isActive(item.route)
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          ]"
          :title="collapsed ? item.label : undefined"
          @click="navigate(item.route)"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="!collapsed" class="text-sm font-medium">{{ item.label }}</span>
        </button>
      </div>

      <!-- System Section -->
      <div v-if="systemItems.length" class="space-y-1">
        <p v-if="!collapsed" class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          System
        </p>
        <div v-else class="border-t border-gray-700 my-2" />
        <button
          v-for="item in systemItems"
          :key="item.id"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            isActive(item.route)
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          ]"
          :title="collapsed ? item.label : undefined"
          @click="navigate(item.route)"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="!collapsed" class="text-sm font-medium">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <!-- Collapse Toggle -->
    <div class="p-2 border-t border-gray-800">
      <button
        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        @click="emit('toggle')"
      >
        <ChevronLeft v-if="!collapsed" class="w-5 h-5" />
        <ChevronRight v-else class="w-5 h-5" />
        <span v-if="!collapsed" class="text-sm">Collapse</span>
      </button>
    </div>
  </nav>
</template>
