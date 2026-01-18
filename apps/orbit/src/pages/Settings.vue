<script setup lang="ts">
import { ref } from 'vue';
import { User, Bell, Shield, Palette, Globe, Save } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const activeTab = ref('profile');

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe },
];

const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
});

function handleSaveProfile() {
  // TODO: Implement profile save
  console.log('Saving profile:', profileForm.value);
}
</script>

<template>
  <div class="h-full overflow-y-auto p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div class="flex gap-8">
        <!-- Sidebar -->
        <nav class="w-48 flex-shrink-0">
          <ul class="space-y-1">
            <li v-for="tab in tabs" :key="tab.id">
              <button
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                ]"
                @click="activeTab = tab.id"
              >
                <component :is="tab.icon" class="w-5 h-5" />
                <span class="font-medium">{{ tab.label }}</span>
              </button>
            </li>
          </ul>
        </nav>

        <!-- Content -->
        <div class="flex-1">
          <!-- Profile Tab -->
          <div
            v-if="activeTab === 'profile'"
            class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Profile Information
            </h2>

            <form class="space-y-6" @submit.prevent="handleSaveProfile">
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  class="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  for="settings-email"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="settings-email"
                  v-model="profileForm.email"
                  type="email"
                  disabled
                  class="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save class="w-4 h-4" />
                Save Changes
              </button>
            </form>
          </div>

          <!-- Other Tabs Placeholder -->
          <div
            v-else
            class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="text-center py-12">
              <p class="text-gray-500 dark:text-gray-400">
                {{ tabs.find((t) => t.id === activeTab)?.label }} settings coming
                soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
