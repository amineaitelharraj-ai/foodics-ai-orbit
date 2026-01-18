/**
 * Fraud Detection API Service
 * 
 * Provides frontend API client for communicating with the fraud detection backend.
 * Handles authentication, error handling, and data transformation.
 */

import axios, { AxiosInstance } from 'axios';

// Types for API responses
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Fraud detection types
export interface POSEvent {
  eventId: string;
  eventType: 'VOID' | 'RETURN' | 'DISCOUNT' | 'REPRINT' | 'CASH_REFUND' | 'CASH_DRAWER_CLOSE';
  posDeviceId: string;
  branchId: string;
  cashierId: string;
  createdAt: string;
  businessTime: string;
  orderId?: string;
  itemId?: string;
  amount?: number;
  discountPct?: number;
  reason?: string;
  shiftId?: string;
  metadata?: Record<string, any>;
}

export interface FraudFlag {
  id: string;
  eventId: string;
  ruleId: string;
  ruleName: string;
  ruleVersion: string;
  branchId: string;
  cashierId: string;
  posDeviceId: string;
  orderId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE' | 'CONFIRMED_FRAUD';
  description: string;
  evidence: Record<string, any>;
  flaggedAt: string;
  resolvedAt?: string;
  investigatedBy?: string;
  investigationNotes?: string;
  resolution?: string;
  riskScore: number;
  actionsTaken: FraudAction[];
  
  // Related entities
  event?: POSEvent;
  rule?: FraudRule;
  branch?: { name: string };
  cashier?: { firstName: string; lastName: string };
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  ruleFamily: 'VOIDS_RETURNS' | 'REPRINTS' | 'DISCOUNTS' | 'CASH_HANDLING' | 'TIMING_OFF_PEAK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enabled: boolean;
  version: string;
  threshold: {
    type: 'count' | 'percentage' | 'amount' | 'time';
    value: number;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
    unit?: string;
  };
  timeWindow?: {
    duration: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  conditions: any[];
  actions: any[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  executionCount: number;
  lastExecuted?: string;
  averageExecutionTimeMs: number;
}

export interface FraudAction {
  id: string;
  type: 'TOAST' | 'EMAIL' | 'SMS' | 'BLOCK_TILL' | 'MANAGER_PIN' | 'LOG';
  timestamp: string;
  target: string;
  payload: Record<string, any>;
  success: boolean;
  error?: string;
  responseTime?: number;
}

export interface FraudMetrics {
  date: string;
  branchId?: string;
  totalTransactions: number;
  flaggedTransactions: number;
  falsePositives: number;
  confirmedFraud: number;
  potentialLossPrevented: number;
  actualLossAmount: number;
  averageProcessingTimeMs: number;
  ruleEngineLatencyP99: number;
  alertResponseTimeMs: number;
  ruleAccuracy: Record<string, number>;
  ruleExecutionCount: Record<string, number>;
}

export interface DashboardData {
  today: {
    totalTransactions: number;
    flaggedTransactions: number;
    confirmedFraud: number;
    falsePositives: number;
    lossPrevented: number;
  };
  recentFlags: FraudFlag[];
  activeRulesCount: number;
  processingStats: {
    totalProcessed: number;
    totalFailed: number;
    averageProcessingTimeMs: number;
    lastProcessedAt?: string;
    currentBacklog: number;
  };
  systemHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, string>;
  };
}

// Query parameters for filtering
export interface FraudFlagFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  branchId?: string;
  cashierId?: string;
  severity?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  ruleFamily?: string;
}

export interface MetricsFilters {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  interval?: 'daily' | 'weekly' | 'monthly';
}

/**
 * Fraud Detection API Client
 */
class FraudAPIService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use different URLs based on environment
    const isProduction = window.location.hostname !== 'localhost';
    this.baseURL = isProduction 
      ? 'https://orbit-production-a351.up.railway.app'  // Railway backend URL
      : 'http://localhost:3001';
    console.log('🔗 Fraud API configured with base URL:', this.baseURL);
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api/fraud`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: any) => {
        // Add authentication token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        console.error('API Error:', error);
        
        if (error.response?.status === 401) {
          // Handle authentication error
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        // Log backend connectivity issues
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          console.warn('🚨 Backend not available - check backend deployment');
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }



  /**
   * Handle API errors and convert to user-friendly messages
   */
  private handleError(error: any): string {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // ============================================================================
  // POS Event Management
  // ============================================================================

  /**
   * Submit a POS event for fraud detection
   */
  async submitPOSEvent(event: Omit<POSEvent, 'eventId'>): Promise<APIResponse<{ eventId: string; messageId?: string }>> {
    try {
      const eventData: POSEvent = {
        ...event,
        eventId: this.generateRequestId(), // Generate unique event ID
      };

      const response = await this.api.post<APIResponse<{ eventId: string; messageId?: string }>>('/events', eventData);
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  // ============================================================================
  // Fraud Flag Management
  // ============================================================================

  /**
   * Get fraud flags with filtering and pagination
   */
  async getFraudFlags(filters: FraudFlagFilters = {}): Promise<PaginatedResponse<FraudFlag>> {
    try {
      const response = await this.api.get<PaginatedResponse<FraudFlag>>('/flags', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Get specific fraud flag by ID
   */
  async getFraudFlag(flagId: string): Promise<APIResponse<FraudFlag>> {
    try {
      const response = await this.api.get<APIResponse<FraudFlag>>(`/flags/${flagId}`);
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Update fraud flag (investigation)
   */
  async updateFraudFlag(
    flagId: string, 
    updates: {
      status?: string;
      investigatedBy?: string;
      investigationNotes?: string;
      resolution?: string;
    }
  ): Promise<APIResponse<FraudFlag>> {
    try {
      const response = await this.api.patch<APIResponse<FraudFlag>>(`/flags/${flagId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  // ============================================================================
  // Fraud Rule Management
  // ============================================================================

  /**
   * Get all fraud detection rules
   */
  async getFraudRules(filters: { enabled?: boolean; ruleFamily?: string } = {}): Promise<APIResponse<FraudRule[]>> {
    try {
      const response = await this.api.get<APIResponse<FraudRule[]>>('/rules', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Create new fraud detection rule
   */
  async createFraudRule(ruleData: Omit<FraudRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecuted' | 'averageExecutionTimeMs'>): Promise<APIResponse<FraudRule>> {
    try {
      const response = await this.api.post<APIResponse<FraudRule>>('/rules', ruleData);
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Update fraud detection rule
   */
  async updateFraudRule(ruleId: string, updates: Partial<FraudRule>): Promise<APIResponse<FraudRule>> {
    try {
      const response = await this.api.patch<APIResponse<FraudRule>>(`/rules/${ruleId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Delete fraud detection rule
   */
  async deleteFraudRule(ruleId: string): Promise<APIResponse> {
    try {
      const response = await this.api.delete<APIResponse>(`/rules/${ruleId}`);
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Toggle rule enabled/disabled status
   */
      async toggleFraudRule(ruleId: string, enabled: boolean): Promise<APIResponse<FraudRule>> {
      return this.updateFraudRule(ruleId, { enabled });
    }

  // ============================================================================
  // Analytics and Metrics
  // ============================================================================

  /**
   * Get fraud detection metrics
   */
  async getFraudMetrics(filters: MetricsFilters = {}): Promise<APIResponse<{ metrics: FraudMetrics[]; summary: any }>> {
    try {
      const response = await this.api.get<APIResponse<{ metrics: FraudMetrics[]; summary: any }>>('/metrics', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Get dashboard summary data
   */
  async getDashboard(): Promise<APIResponse<DashboardData>> {
    try {
      const response = await this.api.get<APIResponse<DashboardData>>('/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<any> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  // ============================================================================
  // WebSocket Connection Management
  // ============================================================================

  /**
   * Create WebSocket connection for real-time updates
   */
  createWebSocketConnection(options: {
    onFraudAlert?: (flag: FraudFlag) => void;
    onEventProcessed?: (data: any) => void;
    onSystemUpdate?: (data: any) => void;
    onError?: (error: Error) => void;
  }): WebSocket | null {
    try {
      const wsUrl = this.baseURL.replace('http', 'ws').replace('3001', '3002'); // WebSocket port
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        
        // Authenticate the connection
        ws.send(JSON.stringify({
          type: 'auth',
          payload: {
            type: 'dashboard',
            token: localStorage.getItem('authToken') || 'demo-token'
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'fraud_alert':
              if (options.onFraudAlert) {
                options.onFraudAlert(message.payload.flag);
              }
              break;
              
            case 'event_processed':
              if (options.onEventProcessed) {
                options.onEventProcessed(message.payload);
              }
              break;
              
            case 'system_status':
              if (options.onSystemUpdate) {
                options.onSystemUpdate(message.payload);
              }
              break;
              
            case 'error':
              console.error('WebSocket error:', message.payload.error);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (options.onError) {
          options.onError(new Error('WebSocket connection error'));
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      if (options.onError) {
        options.onError(error as Error);
      }
      return null;
    }
  }
}

// Export singleton instance
export const fraudAPI = new FraudAPIService();
export default fraudAPI; 