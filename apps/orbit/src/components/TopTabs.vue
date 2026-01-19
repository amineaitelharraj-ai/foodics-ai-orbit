<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  User,
  LogOut,
  Moon,
  Sun,
  MessageSquare,
  Lightbulb,
  Package,
  Mic,
  Palette,
} from 'lucide-vue-next';
import { ref } from 'vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

const tabs = [
  { name: 'Assistant', path: '/assistant', icon: MessageSquare },
  { name: 'Insights', path: '/insights', icon: Lightbulb },
  { name: 'InventoryGuru', path: '/inventory-guru', icon: Package },
  { name: 'Say and Serve', path: '/call-flow', icon: Mic },
  { name: 'PlatStudio', path: '/plat-studio', icon: Palette },
];

const currentTab = computed(() => {
  return tabs.find((tab) => route.path.startsWith(tab.path))?.path || '/assistant';
});

function navigateTo(path: string) {
  router.push(path);
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <!-- Top Bar with Title and Actions -->
    <div class="h-14 px-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">
        AI Orbit
      </h1>

      <!-- Right Actions -->
      <div class="flex items-center gap-2">
        <!-- Dark Mode Toggle -->
        <button
          class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Toggle dark mode"
          @click="toggleDarkMode"
        >
          <Moon v-if="!isDarkMode" class="w-5 h-5" />
          <Sun v-else class="w-5 h-5" />
        </button>

        <!-- User Menu -->
        <div class="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <User class="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <button
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Logout"
            @click="handleLogout"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="px-6 flex gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        class="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative"
        :class="
          currentTab === tab.path
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        "
        @click="navigateTo(tab.path)"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.name }}
        <!-- Active indicator -->
        <span
          v-if="currentTab === tab.path"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
        />
      </button>
    </nav>
  </header>
</template>
