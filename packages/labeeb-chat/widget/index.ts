/**
 * Labeeb Chat Widget - Standalone Bundle
 *
 * This module exports everything needed to embed the Labeeb Chat
 * as a standalone widget in any webpage.
 *
 * Usage with script tag:
 * ```html
 * <script src="labeeb-widget.umd.js"></script>
 * <script>
 *   const widget = LabeebWidget.createLabeebWidget({
 *     container: '#chat-container',
 *     token: 'your-auth-token',
 *     title: 'AI Assistant'
 *   });
 * </script>
 * ```
 *
 * Usage with ES modules:
 * ```js
 * import { createLabeebWidget } from '@foodics/labeeb-chat/widget';
 *
 * const widget = createLabeebWidget({
 *   container: '#chat-container',
 *   token: 'your-auth-token'
 * });
 * ```
 */

export { LabeebWidget, createLabeebWidget } from './LabeebWidget';
export type { LabeebWidgetOptions } from './LabeebWidget';

// Re-export types that might be useful for widget consumers
export type { Message } from '../src/types/messages';
