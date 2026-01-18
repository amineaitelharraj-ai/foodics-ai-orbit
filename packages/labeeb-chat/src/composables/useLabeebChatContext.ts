import { inject } from 'vue';
import type { UseLabeebChatReturn } from './useLabeebChat';

const LABEEB_CHAT_KEY = 'labeeb-chat';

/**
 * Injects the Labeeb Chat context provided by LabeebChatProvider
 * Must be used within a component that is a descendant of LabeebChatProvider
 */
export function useLabeebChatContext(): UseLabeebChatReturn {
  const context = inject<UseLabeebChatReturn>(LABEEB_CHAT_KEY);

  if (!context) {
    throw new Error(
      'useLabeebChatContext must be used within a LabeebChatProvider. ' +
      'Make sure your component is wrapped with <LabeebChatProvider>.'
    );
  }

  return context;
}

/**
 * Optionally injects the Labeeb Chat context
 * Returns undefined if not within a LabeebChatProvider
 */
export function useLabeebChatContextOptional(): UseLabeebChatReturn | undefined {
  return inject<UseLabeebChatReturn | undefined>(LABEEB_CHAT_KEY, undefined);
}
