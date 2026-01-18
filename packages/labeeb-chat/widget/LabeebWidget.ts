import { createApp, App, h } from 'vue';
import LabeebChat from '../src/LabeebChat.vue';

export interface LabeebWidgetOptions {
  /** Container element or selector */
  container: string | HTMLElement;
  /** Authentication token for WebSocket connection */
  token: string;
  /** Optional ID token for additional auth */
  idToken?: string;
  /** Base URL for the WebSocket server */
  baseUrl?: string;
  /** Custom title for the chat header */
  title?: string;
  /** Custom subtitle for the chat header */
  subtitle?: string;
  /** Whether to show the header */
  showHeader?: boolean;
  /** Suggestion questions for empty state */
  suggestions?: Array<{ label: string; query: string }>;
  /** Callback when token expires */
  onTokenExpired?: () => void;
  /** Callback when a message is sent */
  onMessageSent?: (message: string) => void;
  /** Callback when session changes */
  onSessionChanged?: (sessionId: string | null) => void;
}

export class LabeebWidget {
  private app: App | null = null;
  private container: HTMLElement | null = null;
  private options: LabeebWidgetOptions;

  constructor(options: LabeebWidgetOptions) {
    this.options = options;
  }

  /**
   * Mount the widget to the DOM
   */
  mount(): void {
    // Resolve container
    if (typeof this.options.container === 'string') {
      this.container = document.querySelector(this.options.container);
      if (!this.container) {
        throw new Error(`Container "${this.options.container}" not found`);
      }
    } else {
      this.container = this.options.container;
    }

    // Create Vue app
    this.app = createApp({
      render: () =>
        h(LabeebChat, {
          token: this.options.token,
          idToken: this.options.idToken,
          baseUrl: this.options.baseUrl,
          title: this.options.title,
          subtitle: this.options.subtitle,
          showHeader: this.options.showHeader,
          suggestions: this.options.suggestions,
          onTokenExpired: this.options.onTokenExpired,
          onMessageSent: this.options.onMessageSent,
          onSessionChanged: this.options.onSessionChanged,
        }),
    });

    // Mount the app
    this.app.mount(this.container);
  }

  /**
   * Unmount and destroy the widget
   */
  destroy(): void {
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
  }

  /**
   * Update the authentication token
   */
  updateToken(token: string, idToken?: string): void {
    // For now, we need to remount to update tokens
    // In future, could implement reactive token updates
    if (this.app && this.container) {
      this.options.token = token;
      if (idToken) {
        this.options.idToken = idToken;
      }
      this.destroy();
      this.mount();
    }
  }
}

/**
 * Create and mount a Labeeb Chat widget
 */
export function createLabeebWidget(options: LabeebWidgetOptions): LabeebWidget {
  const widget = new LabeebWidget(options);
  widget.mount();
  return widget;
}

export default LabeebWidget;
