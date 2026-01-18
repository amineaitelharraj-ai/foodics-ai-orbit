import type { HITLPreview, HITLStatus } from './hitl-previews';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'hitl';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  hitlData?: {
    preview: HITLPreview;
    session_id: string;
    tool_name: string;
    status: HITLStatus;
    generatedImageUrl?: string;
  };
}

export interface InterruptEvent {
  session_id: string;
  action: string;
  tool_name: string;
  preview: HITLPreview;
  arguments: Record<string, unknown>;
}

export interface ApprovalAckEvent {
  session_id: string;
  processed: boolean;
}

export interface QueryClarificationData {
  sessionId: string;
  toolName: string;
  message: string;
  suggestedFilters: Array<{ name: string; description: string }>;
}

export type WebSocketMessage =
  | { type: 'token'; content: string }
  | {
      type: 'interrupt';
      session_id: string;
      action: string;
      tool_name: string;
      preview: string;
      arguments: Record<string, unknown>;
    }
  | { type: 'complete'; session_id: string }
  | { type: 'approval_ack'; session_id: string; decision: string }
  | { type: 'tool_start'; tool_name: string; message: string }
  | { type: 'tool_end'; tool_name: string }
  | { type: 'complex_query_notice'; message: string }
  | { type: 'large_data_notice'; message: string }
  | {
      type: 'query_clarification';
      session_id: string;
      tool_name: string;
      message: string;
      suggested_filters: Array<{ name: string; description: string }>;
      arguments: Record<string, unknown>;
    }
  | { type: 'clarification_ack'; session_id: string; action: 'proceed' | 'refine' }
  | { type: 'refinement_applied'; session_id: string; refinement: string; tool_name: string }
  | { type: 'error'; message: string; pending_tool?: string }
  | { type: 'pong' };

export type ClientMessage =
  | { type: 'message'; content: string; session_id?: string }
  | { type: 'approve'; session_id: string; decision: 'approve' | 'reject'; reason?: string }
  | {
      type: 'clarification_response';
      session_id: string;
      action: 'proceed' | 'refine';
      refinement?: string;
    }
  | { type: 'ping' };

export interface ToolStatusEvent {
  name: string;
  status: 'running' | 'completed' | 'error';
  message?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface StructuredContent {
  type: 'table' | 'chart' | 'list' | 'code';
  data: unknown;
  title?: string;
}
