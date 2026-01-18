<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { User, LogOut, Moon, Sun } from 'lucide-vue-next';
import { ref } from 'vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/assistant': 'AI Assistant',
    '/insights': 'Business Insights',
    '/settings': 'Settings',
    '/help': 'Help & Support',
  };
  return titles[route.path] || 'Orbit';
});

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
  <header class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
    <!-- Page Title -->
    <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
      {{ pageTitle }}
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
  </header>
</template>
