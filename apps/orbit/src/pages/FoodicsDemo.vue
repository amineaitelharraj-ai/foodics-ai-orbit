<script setup lang="ts">
import { ref } from 'vue';
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  User,
  ChevronRight,
  Search,
  Eye,
  EyeOff,
  Mail,
  Lock,
} from 'lucide-vue-next';

const showModal = ref(false);
const loading = ref(false);
const inputValue = ref('');
const searchValue = ref('');
const emailValue = ref('');
const passwordValue = ref('');
const showPassword = ref(false);

const handleAsyncAction = async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  loading.value = false;
  alert('Action completed successfully!');
};
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Foodics Design System - Vue 3</h1>

    <!-- Buttons Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Buttons</h2>

      <!-- Button Variants -->
      <div class="mb-8">
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Variants</h3>
        <div class="flex flex-wrap gap-3">
          <button class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200">
            Default
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Primary
          </button>
          <button class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Secondary
          </button>
          <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Danger
          </button>
          <button class="px-4 py-2 text-blue-600 hover:underline transition-colors dark:text-blue-400">
            Link
          </button>
          <button class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors dark:text-gray-400 dark:hover:text-gray-200">
            Text
          </button>
        </div>
      </div>

      <!-- Button Sizes -->
      <div class="mb-8">
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Sizes</h3>
        <div class="flex flex-wrap items-center gap-3">
          <button class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Small
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Medium
          </button>
          <button class="px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Large
          </button>
        </div>
      </div>

      <!-- Button States -->
      <div class="mb-8">
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">States</h3>
        <div class="flex flex-wrap items-center gap-3">
          <button
            disabled
            class="px-4 py-2 bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed"
          >
            Disabled
          </button>
          <button
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            @click="handleAsyncAction"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            {{ loading ? 'Loading...' : 'Click Me' }}
          </button>
        </div>
      </div>

      <!-- Buttons with Icons -->
      <div class="mb-8">
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">With Icons</h3>
        <div class="flex flex-wrap gap-3">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <CheckCircle class="w-4 h-4" />
            Approve
          </button>
          <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <XCircle class="w-4 h-4" />
            Reject
          </button>
          <button class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
            Next
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>

    <!-- Alerts Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Alerts</h2>
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 dark:bg-blue-900/20 dark:border-blue-800">
          <Info class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="font-medium text-blue-800 dark:text-blue-300">Information</h4>
            <p class="text-blue-700 dark:text-blue-400 text-sm">This is an informational alert message.</p>
          </div>
        </div>

        <div class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="font-medium text-green-800 dark:text-green-300">Success</h4>
            <p class="text-green-700 dark:text-green-400 text-sm">Your action was completed successfully.</p>
          </div>
        </div>

        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 dark:bg-yellow-900/20 dark:border-yellow-800">
          <AlertTriangle class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="font-medium text-yellow-800 dark:text-yellow-300">Warning</h4>
            <p class="text-yellow-700 dark:text-yellow-400 text-sm">Please review this before continuing.</p>
          </div>
        </div>

        <div class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 dark:bg-red-900/20 dark:border-red-800">
          <XCircle class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="font-medium text-red-800 dark:text-red-300">Error</h4>
            <p class="text-red-700 dark:text-red-400 text-sm">Something went wrong. Please try again.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Cards Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Cards</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-white dark:bg-gray-800 rounded-xl">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default Card</h3>
          <p class="text-gray-600 dark:text-gray-400">This is a basic card with no border.</p>
        </div>

        <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bordered Card</h3>
          <p class="text-gray-600 dark:text-gray-400">This card has a subtle border.</p>
        </div>

        <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Elevated Card</h3>
          <p class="text-gray-600 dark:text-gray-400">This card has a shadow elevation.</p>
        </div>
      </div>
    </section>

    <!-- Input Fields Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Input Fields</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Input</label>
          <input
            v-model="inputValue"
            type="text"
            placeholder="Enter text..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">With Icon</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchValue"
              type="text"
              placeholder="Search..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Input</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="emailValue"
              type="email"
              placeholder="email@example.com"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Input</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="passwordValue"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password"
              class="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Disabled Input</label>
          <input
            type="text"
            placeholder="Disabled"
            disabled
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-red-600 dark:text-red-400 mb-2">Error State</label>
          <input
            type="text"
            placeholder="Invalid input"
            class="w-full px-4 py-2 border border-red-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <p class="mt-1 text-sm text-red-600 dark:text-red-400">This field is required</p>
        </div>
      </div>
    </section>

    <!-- Avatars Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Avatars</h2>
      <div class="flex flex-wrap items-end gap-4">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
          SM
        </div>
        <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
          MD
        </div>
        <div class="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
          LG
        </div>
        <div class="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-lg font-medium">
          XL
        </div>
        <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <User class="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </section>

    <!-- Modal Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Modal</h2>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="showModal = true"
      >
        Open Modal
      </button>

      <!-- Modal Overlay -->
      <Teleport to="body">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click.self="showModal = false"
        >
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Modal Title</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This is a modal dialog. You can put any content here including forms, images, or other components.
            </p>
            <div class="flex justify-end gap-3">
              <button
                class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                @click="showModal = false"
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                @click="showModal = false"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </section>

    <!-- Badges Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Badges</h2>
      <div class="flex flex-wrap gap-3">
        <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-medium">
          Default
        </span>
        <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm font-medium">
          Primary
        </span>
        <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm font-medium">
          Success
        </span>
        <span class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-sm font-medium">
          Warning
        </span>
        <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-sm font-medium">
          Danger
        </span>
        <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-sm font-medium">
          Info
        </span>
      </div>
    </section>

    <!-- Progress Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Progress Bars</h2>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">25%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" style="width: 25%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">50%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-green-600 h-2 rounded-full" style="width: 50%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">75%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-yellow-500 h-2 rounded-full" style="width: 75%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">100%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-green-600 h-2 rounded-full" style="width: 100%"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
