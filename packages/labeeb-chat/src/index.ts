// Labeeb Chat - Vue 3 Widget Package
// Main entry point for the package

// Main Components
export { default as LabeebChat } from './LabeebChat.vue';
export type { LabeebChatProps } from './LabeebChat.vue';
export { default as LabeebChatProvider } from './LabeebChatProvider.vue';
export type { LabeebChatProviderProps } from './LabeebChatProvider.vue';

// Chat UI Components
export {
  ChatInput,
  MessageBubble,
  MessageList,
  StreamingIndicator,
  QueryClarification,
  StructuredResponse,
} from './components';

// Re-export component types
export type {
  Pagination,
  ChartConfig,
  DisplayType,
  WriteResult,
  StructuredResponseData,
} from './components';

// Composables
export * from './composables';

// Types
export * from './types';

// Version
export const VERSION = '0.1.0';
