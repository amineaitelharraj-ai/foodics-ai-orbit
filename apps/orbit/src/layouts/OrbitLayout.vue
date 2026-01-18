<script setup lang="ts">
import { ref } from 'vue';
import LeftNav from '../components/LeftNav.vue';
import TopTabs from '../components/TopTabs.vue';

const sidebarCollapsed = ref(false);

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}
</script>

<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Left Navigation -->
    <LeftNav :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Tabs -->
      <TopTabs />

      <!-- Page Content -->
      <main class="flex-1 overflow-hidden">
        <router-view />
      </main>
    </div>
  </div>
</template>
