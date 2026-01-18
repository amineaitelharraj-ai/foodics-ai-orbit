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
} from 'lucide-vue-next';

interface NavItem {
  id: string;
  label: string;
  icon: typeof MessageSquare;
  route: string;
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
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare, route: '/assistant' },
  { id: 'insights', label: 'Insights', icon: BarChart3, route: '/insights' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
  { id: 'help', label: 'Help', icon: HelpCircle, route: '/help' },
];

const currentRoute = computed(() => route.path);

function navigate(path: string) {
  router.push(path);
}
</script>

<template>
  <nav
    :class="[
      'h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Logo -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Zap class="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <span
          v-if="!collapsed"
          class="font-bold text-xl text-gray-900 dark:text-white"
        >
          Orbit
        </span>
      </div>
    </div>

    <!-- Navigation Items -->
    <div class="flex-1 py-4 px-2 space-y-1">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
          currentRoute === item.route || currentRoute.startsWith(item.route + '/')
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
        :title="collapsed ? item.label : undefined"
        @click="navigate(item.route)"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="font-medium">{{ item.label }}</span>
      </button>
    </div>

    <!-- Collapse Toggle -->
    <div class="p-2 border-t border-gray-200 dark:border-gray-700">
      <button
        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        @click="emit('toggle')"
      >
        <ChevronLeft v-if="!collapsed" class="w-5 h-5" />
        <ChevronRight v-else class="w-5 h-5" />
        <span v-if="!collapsed" class="text-sm">Collapse</span>
      </button>
    </div>
  </nav>
</template>
