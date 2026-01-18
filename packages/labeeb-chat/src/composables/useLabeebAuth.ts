import { ref, computed, onMounted, readonly, type Ref, type ComputedRef, type DeepReadonly } from 'vue';
import {
  cognitoAuth,
  type AuthTokens,
  type AuthUser,
} from '@shared/api/cognito-auth';

export interface UseLabeebAuthReturn {
  // State
  user: DeepReadonly<Ref<AuthUser | null>>;
  tokens: DeepReadonly<Ref<AuthTokens | null>>;
  isLoading: DeepReadonly<Ref<boolean>>;
  isAuthenticated: ComputedRef<boolean>;
  isConfigured: ComputedRef<boolean>;
  error: DeepReadonly<Ref<string | null>>;

  // Methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => void;
  forgotPassword: (email: string) => Promise<void>;
  confirmPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

export function useLabeebAuth(): UseLabeebAuthReturn {
  // State
  const user = ref<AuthUser | null>(null);
  const tokens = ref<AuthTokens | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => user.value !== null);
  const isConfigured = computed(() => cognitoAuth.isConfigured());

  // Check auth state on mount
  const checkAuth = async (): Promise<void> => {
    if (!isConfigured.value) {
      isLoading.value = false;
      return;
    }

    try {
      const currentUser = await cognitoAuth.getCurrentUser();
      const currentTokens = await cognitoAuth.getTokens();
      user.value = currentUser;
      tokens.value = currentTokens;
    } catch {
      user.value = null;
      tokens.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Methods
  const signIn = async (email: string, password: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const authTokens = await cognitoAuth.signIn({ email, password });
      tokens.value = authTokens;
      const currentUser = await cognitoAuth.getCurrentUser();
      user.value = currentUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const signUp = async (email: string, password: string, name?: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      await cognitoAuth.signUp({ email, password, name });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const confirmSignUp = async (email: string, code: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      await cognitoAuth.confirmSignUp({ email, code });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Confirmation failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const signOut = (): void => {
    cognitoAuth.signOut();
    user.value = null;
    tokens.value = null;
  };

  const forgotPassword = async (email: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      await cognitoAuth.forgotPassword(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset request failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const confirmPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      await cognitoAuth.confirmPassword(email, code, newPassword);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  const refreshAuth = async (): Promise<void> => {
    await checkAuth();
  };

  // Initialize on mount
  onMounted(() => {
    checkAuth();
  });

  return {
    // State (readonly)
    user: readonly(user),
    tokens: readonly(tokens),
    isLoading: readonly(isLoading),
    isAuthenticated,
    isConfigured,
    error: readonly(error),

    // Methods
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    forgotPassword,
    confirmPassword,
    clearError,
    refreshAuth,
  };
}
