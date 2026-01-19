<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Zap, AlertCircle } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import {
  FdxButton,
  FdxInputText,
  FdxInputPassword,
  FdxCard,
} from '@foodics/ui-common';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const localError = ref<string | null>(null);

const isLoading = computed(() => authStore.isLoading);
const error = computed(() => localError.value || authStore.error);

async function handleSubmit() {
  localError.value = null;

  if (!email.value || !password.value) {
    localError.value = 'Please enter email and password';
    return;
  }

  try {
    await authStore.signIn(email.value, password.value);
    const redirect = (route.query.redirect as string) || '/assistant';
    router.push(redirect);
  } catch {
    // Error is handled by the store
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
          <Zap class="w-8 h-8 text-primary-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">
          Welcome to Orbit
        </h1>
        <p class="text-gray-600 mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <!-- Login Form -->
      <FdxCard class="p-8">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <span class="text-sm">{{ error }}</span>
          </div>

          <!-- Email Input -->
          <FdxInputText
            v-model="email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />

          <!-- Password Input -->
          <FdxInputPassword
            v-model="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
          />

          <!-- Submit Button -->
          <FdxButton
            type="submit"
            :loading="isLoading"
            :disabled="isLoading"
            class="w-full"
            size="lg"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </FdxButton>
        </form>
      </FdxCard>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Powered by Foodics AI
      </p>
    </div>
  </div>
</template>
