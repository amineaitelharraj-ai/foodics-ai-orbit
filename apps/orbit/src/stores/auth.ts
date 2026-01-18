import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { cognitoAuth } from '@shared/api/cognito-auth';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
}

const STORAGE_KEY = 'orbit_auth';

function loadFromStorage(): { user: AuthUser | null; tokens: AuthTokens | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Invalid data in storage
  }
  return { user: null, tokens: null };
}

function saveToStorage(user: AuthUser | null, tokens: AuthTokens | null) {
  if (user && tokens) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = loadFromStorage();

  const user = ref<AuthUser | null>(stored.user);
  const tokens = ref<AuthTokens | null>(stored.tokens);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!tokens.value);
  const accessToken = computed(() => tokens.value?.accessToken || '');
  const idToken = computed(() => tokens.value?.idToken || '');

  // Actions
  async function signIn(email: string, password: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      if (!cognitoAuth.isConfigured()) {
        throw new Error('Cognito not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID');
      }

      const authTokens = await cognitoAuth.signIn({ email, password });
      const authUser = await cognitoAuth.getCurrentUser();

      if (!authUser) throw new Error('Failed to get user info');

      user.value = {
        id: authUser.sub,
        email: authUser.email,
        name: authUser.name,
      };
      tokens.value = authTokens;
      saveToStorage(user.value, authTokens);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      if (!cognitoAuth.isConfigured()) {
        throw new Error('Cognito not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID');
      }

      await cognitoAuth.signUp({ email, password, name });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function confirmSignUp(email: string, code: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      if (!cognitoAuth.isConfigured()) {
        throw new Error('Cognito not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID');
      }

      await cognitoAuth.confirmSignUp({ email, code });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Confirmation failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    cognitoAuth.signOut();
    user.value = null;
    tokens.value = null;
    saveToStorage(null, null);
  }

  function clearError() {
    error.value = null;
  }

  function setTokens(newTokens: AuthTokens) {
    tokens.value = newTokens;
    if (user.value) {
      saveToStorage(user.value, newTokens);
    }
  }

  return {
    // State
    user,
    tokens,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    accessToken,
    idToken,

    // Actions
    signIn,
    signUp,
    confirmSignUp,
    logout,
    clearError,
    setTokens,
  };
});
