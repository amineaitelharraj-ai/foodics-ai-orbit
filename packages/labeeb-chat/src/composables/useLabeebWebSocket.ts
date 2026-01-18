import { ref, shallowRef, onUnmounted, readonly, type Ref, type DeepReadonly } from 'vue';
import {
  LabeebClient,
  type LabeebClientOptions,
  type InterruptEvent,
  type ApprovalAckEvent,
  type QueryClarificationData,
  type LabeebError,
} from '@shared/api/labeeb-client';

export interface UseLabeebWebSocketOptions {
  baseUrl: string;
  token: string;
  autoConnect?: boolean;
}

export interface UseLabeebWebSocketReturn {
  // State
  isConnected: DeepReadonly<Ref<boolean>>;
  isConnecting: DeepReadonly<Ref<boolean>>;
  error: DeepReadonly<Ref<LabeebError | null>>;
  sessionId: DeepReadonly<Ref<string | null>>;

  // Methods
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (content: string) => void;
  approve: (sessionId: string, decision: 'approve' | 'reject', reason?: string) => void;
  sendClarificationResponse: (
    sessionId: string,
    action: 'proceed' | 'refine',
    refinement?: string
  ) => void;
  setSessionId: (sessionId: string | null) => void;

  // Event handlers (to be set by consumer)
  onToken: Ref<((content: string) => void) | null>;
  onInterrupt: Ref<((interrupt: InterruptEvent) => void) | null>;
  onComplete: Ref<((sessionId: string) => void) | null>;
  onApprovalAck: Ref<((ack: ApprovalAckEvent) => void) | null>;
  onToolStart: Ref<((toolName: string, message: string) => void) | null>;
  onToolEnd: Ref<((toolName: string) => void) | null>;
  onComplexQueryNotice: Ref<((message: string) => void) | null>;
  onLargeDataNotice: Ref<((message: string) => void) | null>;
  onQueryClarification: Ref<((data: QueryClarificationData) => void) | null>;
  onClarificationAck: Ref<((sessionId: string, action: 'proceed' | 'refine') => void) | null>;
  onRefinementApplied: Ref<
    ((sessionId: string, refinement: string, toolName: string) => void) | null
  >;
}

export function useLabeebWebSocket(options: UseLabeebWebSocketOptions): UseLabeebWebSocketReturn {
  // State
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const error = ref<LabeebError | null>(null);
  const sessionId = ref<string | null>(null);

  // Event handler refs
  const onToken = ref<((content: string) => void) | null>(null);
  const onInterrupt = ref<((interrupt: InterruptEvent) => void) | null>(null);
  const onComplete = ref<((sessionId: string) => void) | null>(null);
  const onApprovalAck = ref<((ack: ApprovalAckEvent) => void) | null>(null);
  const onToolStart = ref<((toolName: string, message: string) => void) | null>(null);
  const onToolEnd = ref<((toolName: string) => void) | null>(null);
  const onComplexQueryNotice = ref<((message: string) => void) | null>(null);
  const onLargeDataNotice = ref<((message: string) => void) | null>(null);
  const onQueryClarification = ref<((data: QueryClarificationData) => void) | null>(null);
  const onClarificationAck = ref<
    ((sessionId: string, action: 'proceed' | 'refine') => void) | null
  >(null);
  const onRefinementApplied = ref<
    ((sessionId: string, refinement: string, toolName: string) => void) | null
  >(null);

  // Client instance (using shallowRef to avoid deep reactivity)
  const client = shallowRef<LabeebClient | null>(null);

  // Create client options with callbacks that forward to refs
  const createClientOptions = (): LabeebClientOptions => ({
    baseUrl: options.baseUrl,
    token: options.token,
    onToken: (content) => onToken.value?.(content),
    onInterrupt: (interrupt) => onInterrupt.value?.(interrupt),
    onComplete: (sid) => {
      sessionId.value = sid;
      onComplete.value?.(sid);
    },
    onApprovalAck: (ack) => onApprovalAck.value?.(ack),
    onToolStart: (toolName, message) => onToolStart.value?.(toolName, message),
    onToolEnd: (toolName) => onToolEnd.value?.(toolName),
    onComplexQueryNotice: (message) => onComplexQueryNotice.value?.(message),
    onLargeDataNotice: (message) => onLargeDataNotice.value?.(message),
    onQueryClarification: (data) => onQueryClarification.value?.(data),
    onClarificationAck: (sid, action) => onClarificationAck.value?.(sid, action),
    onRefinementApplied: (sid, refinement, toolName) =>
      onRefinementApplied.value?.(sid, refinement, toolName),
    onError: (err) => {
      error.value = err;
    },
    onConnectionChange: (connected) => {
      isConnected.value = connected;
      if (connected) {
        error.value = null;
      }
    },
  });

  // Methods
  const connect = async (): Promise<void> => {
    if (client.value?.isConnected()) {
      return;
    }

    isConnecting.value = true;
    error.value = null;

    try {
      client.value = new LabeebClient(createClientOptions());
      await client.value.connect();
    } catch (e) {
      error.value = e as LabeebError;
      throw e;
    } finally {
      isConnecting.value = false;
    }
  };

  const disconnect = (): void => {
    client.value?.disconnect();
    client.value = null;
    isConnected.value = false;
    sessionId.value = null;
  };

  const sendMessage = (content: string): void => {
    if (!client.value) {
      throw new Error('Not connected');
    }
    client.value.sendMessage(content);
  };

  const approve = (sid: string, decision: 'approve' | 'reject', reason?: string): void => {
    if (!client.value) {
      throw new Error('Not connected');
    }
    client.value.approve(sid, decision, reason);
  };

  const sendClarificationResponse = (
    sid: string,
    action: 'proceed' | 'refine',
    refinement?: string
  ): void => {
    if (!client.value) {
      throw new Error('Not connected');
    }
    client.value.sendClarificationResponse(sid, action, refinement);
  };

  const setSessionId = (sid: string | null): void => {
    sessionId.value = sid;
    client.value?.setSessionId(sid);
  };

  // Auto-connect if requested
  if (options.autoConnect) {
    connect().catch((e) => {
      console.error('Auto-connect failed:', e);
    });
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect();
  });

  return {
    // State (readonly)
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    error: readonly(error),
    sessionId: readonly(sessionId),

    // Methods
    connect,
    disconnect,
    sendMessage,
    approve,
    sendClarificationResponse,
    setSessionId,

    // Event handlers
    onToken,
    onInterrupt,
    onComplete,
    onApprovalAck,
    onToolStart,
    onToolEnd,
    onComplexQueryNotice,
    onLargeDataNotice,
    onQueryClarification,
    onClarificationAck,
    onRefinementApplied,
  };
}
