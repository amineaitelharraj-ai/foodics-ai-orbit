import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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
      // TODO: Replace with actual Cognito authentication
      // For now, simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response - replace with actual auth service
      const mockUser: AuthUser = {
        id: '1',
        email,
        name: email.split('@')[0],
      };

      const mockTokens: AuthTokens = {
        accessToken: `mock_access_token_${Date.now()}`,
        idToken: `mock_id_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
      };

      // Validate credentials (mock)
      if (password.length < 6) {
        throw new Error('Invalid credentials');
      }

      user.value = mockUser;
      tokens.value = mockTokens;
      saveToStorage(mockUser, mockTokens);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function signUp(
    _email: string,
    password: string,
    _name?: string
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual Cognito sign up
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Sign up successful - user needs to confirm
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function confirmSignUp(_email: string, _code: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual Cognito confirmation
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Confirmation failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
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
