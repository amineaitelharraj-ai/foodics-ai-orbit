/**
 * WebSocket Service for Real-time Fraud Alerts
 * 
 * Handles real-time communication with POS devices and management interfaces
 * for fraud alerts, toasts, and system notifications.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { Server } from 'http';
import { 
  FraudFlag, 
  WebSocketMessage, 
  FraudAlertMessage, 
  FraudAction 
} from '../types/fraud-events';
import { Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

interface ConnectedClient {
  id: string;
  ws: WebSocket;
  type: 'pos' | 'dashboard' | 'manager';
  deviceId?: string;
  branchId?: string;
  userId?: string;
  connectedAt: Date;
  lastPing?: Date;
}

interface WebSocketConfig {
  port: number;
  heartbeatInterval: number;
  maxConnections: number;
  authTimeout: number;
}

/**
 * WebSocket service for real-time fraud detection communication
 */
export class WebSocketService extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private logger: Logger;
  private config: WebSocketConfig;

  constructor(port: number, logger: Logger, config?: Partial<WebSocketConfig>) {
    super();
    this.logger = logger;
    this.config = {
      port,
      heartbeatInterval: 30000, // 30 seconds
      maxConnections: 1000,
      authTimeout: 10000, // 10 seconds
      ...config
    };
  }

  /**
   * Initialize WebSocket server
   */
  async initialize(): Promise<void> {
    try {
      this.wss = new WebSocketServer({
        port: this.config.port,
        perMessageDeflate: false,
        maxPayload: 16 * 1024 * 1024, // 16MB
      });

      this.wss.on('connection', this.handleConnection.bind(this));
      this.wss.on('error', (error) => {
        this.logger.error('WebSocket server error', error);
        this.emit('error', error);
      });

      this.startHeartbeat();

      this.logger.info('WebSocket server initialized', {
        port: this.config.port,
        maxConnections: this.config.maxConnections
      });

      this.emit('initialized');

    } catch (error) {
      this.logger.error('Failed to initialize WebSocket server', error as Error);
      throw error;
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, request: any): void {
    const clientId = uuidv4();
    const clientIp = request.socket.remoteAddress;

    this.logger.info('New WebSocket connection', { clientId, clientIp });

    // Check connection limit
    if (this.clients.size >= this.config.maxConnections) {
      this.logger.warn('Connection limit reached, rejecting connection', { clientId });
      ws.close(1013, 'Server overloaded');
      return;
    }

    // Create client record
    const client: ConnectedClient = {
      id: clientId,
      ws,
      type: 'dashboard', // Default type
      connectedAt: new Date(),
      lastPing: new Date()
    };

    this.clients.set(clientId, client);

    // Setup message handling
    ws.on('message', (data) => this.handleMessage(clientId, data as Buffer));
    ws.on('close', (code, reason) => this.handleDisconnection(clientId, code, reason));
    ws.on('error', (error) => this.handleClientError(clientId, error));
    ws.on('pong', () => this.handlePong(clientId));

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'system_status',
      payload: {
        status: 'connected',
        clientId,
        timestamp: new Date()
      },
      timestamp: new Date(),
      messageId: uuidv4()
    });

    // Set authentication timeout
    setTimeout(() => {
      const client = this.clients.get(clientId);
      if (client && !client.deviceId && !client.userId) {
        this.logger.warn('Client authentication timeout', { clientId });
        this.disconnectClient(clientId, 'Authentication timeout');
      }
    }, this.config.authTimeout);

    this.emit('clientConnected', { clientId, clientIp });
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(clientId: string, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) {
        this.logger.warn('Message from unknown client', { clientId });
        return;
      }

      this.logger.debug('Received message', {
        clientId,
        type: message.type,
        messageId: message.messageId
      });

      switch (message.type) {
        case 'auth':
          this.handleAuthentication(clientId, message.payload);
          break;

        case 'ping':
          this.handlePing(clientId);
          break;

        case 'manager_response':
          this.handleManagerResponse(clientId, message.payload);
          break;

        case 'subscribe':
          this.handleSubscription(clientId, message.payload);
          break;

        default:
          this.logger.warn('Unknown message type', {
            clientId,
            type: message.type
          });
      }

    } catch (error) {
      this.logger.error('Failed to parse WebSocket message', {
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle client authentication
   */
  private handleAuthentication(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      // Validate authentication payload
      const { type, deviceId, branchId, userId, token } = payload;

      // TODO: Implement proper token validation
      if (!token) {
        this.sendError(clientId, 'Authentication token required');
        return;
      }

      // Update client information
      client.type = type || 'dashboard';
      client.deviceId = deviceId;
      client.branchId = branchId;
      client.userId = userId;

      this.logger.info('Client authenticated', {
        clientId,
        type: client.type,
        deviceId,
        branchId,
        userId
      });

      // Send authentication success
      this.sendToClient(clientId, {
        type: 'auth_success',
        payload: {
          clientId,
          authenticated: true
        },
        timestamp: new Date(),
        messageId: uuidv4()
      });

      this.emit('clientAuthenticated', { clientId, client });

    } catch (error) {
      this.logger.error('Authentication failed', { clientId, error });
      this.sendError(clientId, 'Authentication failed');
    }
  }

  /**
   * Handle ping from client
   */
  private handlePing(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = new Date();
      this.sendToClient(clientId, {
        type: 'pong',
        payload: { timestamp: new Date() },
        timestamp: new Date(),
        messageId: uuidv4()
      });
    }
  }

  /**
   * Handle pong response from client
   */
  private handlePong(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = new Date();
    }
  }

  /**
   * Handle manager response to fraud alert
   */
  private handleManagerResponse(clientId: string, payload: any): void {
    const { flagId, action, response } = payload;
    
    this.logger.info('Manager response received', {
      clientId,
      flagId,
      action,
      response
    });

    // Emit event for fraud detection service to handle
    this.emit('managerResponse', {
      clientId,
      flagId,
      action,
      response,
      timestamp: new Date()
    });
  }

  /**
   * Handle client subscription to specific events
   */
  private handleSubscription(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { events, branchId, filters } = payload;

    this.logger.info('Client subscription updated', {
      clientId,
      events,
      branchId,
      filters
    });

    // Store subscription preferences (implement as needed)
    // This could be used to filter which alerts are sent to which clients
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(clientId: string, code: number, reason: Buffer): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.logger.info('Client disconnected', {
        clientId,
        type: client.type,
        deviceId: client.deviceId,
        code,
        reason: reason.toString()
      });

      this.clients.delete(clientId);
      this.emit('clientDisconnected', { clientId, client, code, reason });
    }
  }

  /**
   * Handle client error
   */
  private handleClientError(clientId: string, error: Error): void {
    this.logger.error('Client WebSocket error', {
      clientId,
      error: error.message
    });

    this.emit('clientError', { clientId, error });
  }

  /**
   * Disconnect a specific client
   */
  private disconnectClient(clientId: string, reason: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.ws.close(1000, reason);
      this.clients.delete(clientId);
    }
  }

  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, message: WebSocketMessage): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this.logger.error('Failed to send message to client', {
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Send error message to client
   */
  private sendError(clientId: string, error: string): void {
    this.sendToClient(clientId, {
      type: 'error',
      payload: { error },
      timestamp: new Date(),
      messageId: uuidv4()
    });
  }

  /**
   * Broadcast fraud alert to relevant clients
   */
  public broadcastFraudAlert(flag: FraudFlag): void {
    const alertMessage: FraudAlertMessage = {
      type: 'fraud_alert',
      payload: {
        flag,
        event: null as any, // Will be populated if needed
        requiredActions: this.determineRequiredActions(flag)
      },
      timestamp: new Date(),
      messageId: uuidv4()
    };

    // Send to POS devices in the same branch
    const posClients = Array.from(this.clients.values()).filter(
      client => client.type === 'pos' && client.branchId === flag.branchId
    );

    posClients.forEach(client => {
      const sent = this.sendToClient(client.id, alertMessage);
      if (sent) {
        this.logger.info('Fraud alert sent to POS', {
          clientId: client.id,
          deviceId: client.deviceId,
          flagId: flag.id
        });
      }
    });

    // Send to dashboard clients
    const dashboardClients = Array.from(this.clients.values()).filter(
      client => client.type === 'dashboard' || client.type === 'manager'
    );

    dashboardClients.forEach(client => {
      this.sendToClient(client.id, alertMessage);
    });

    this.logger.info('Fraud alert broadcasted', {
      flagId: flag.id,
      posClientsNotified: posClients.length,
      dashboardClientsNotified: dashboardClients.length
    });
  }

  /**
   * Broadcast general message to all or filtered clients
   */
  public broadcastMessage(type: string, payload: any, filter?: (client: ConnectedClient) => boolean): void {
    const message: WebSocketMessage = {
      type: type as any,
      payload,
      timestamp: new Date(),
      messageId: uuidv4()
    };

    let sentCount = 0;
    this.clients.forEach(client => {
      if (!filter || filter(client)) {
        if (this.sendToClient(client.id, message)) {
          sentCount++;
        }
      }
    });

    this.logger.debug('Message broadcasted', {
      type,
      clientsNotified: sentCount,
      totalClients: this.clients.size
    });
  }

  /**
   * Send toast notification to specific POS device
   */
  public sendPOSToast(deviceId: string, message: string, severity: 'info' | 'warning' | 'error' = 'warning'): boolean {
    const client = Array.from(this.clients.values()).find(
      c => c.type === 'pos' && c.deviceId === deviceId
    );

    if (!client) {
      this.logger.warn('POS device not connected for toast', { deviceId });
      return false;
    }

    const toastMessage: WebSocketMessage = {
      type: 'toast',
      payload: {
        message,
        severity,
        duration: 10000, // 10 seconds
        requiresAcknowledgment: severity === 'error'
      },
      timestamp: new Date(),
      messageId: uuidv4()
    };

    return this.sendToClient(client.id, toastMessage);
  }

  /**
   * Request manager PIN for high-severity fraud
   */
  public requestManagerPin(branchId: string, flagId: string, reason: string): void {
    const managerClients = Array.from(this.clients.values()).filter(
      client => (client.type === 'manager' || client.type === 'dashboard') && 
                 (!client.branchId || client.branchId === branchId)
    );

    const pinRequest: WebSocketMessage = {
      type: 'manager_pin_required',
      payload: {
        flagId,
        branchId,
        reason,
        timeout: 300000 // 5 minutes
      },
      timestamp: new Date(),
      messageId: uuidv4()
    };

    managerClients.forEach(client => {
      this.sendToClient(client.id, pinRequest);
    });

    this.logger.info('Manager PIN requested', {
      flagId,
      branchId,
      managersNotified: managerClients.length
    });
  }

  /**
   * Determine required actions for fraud flag
   */
  private determineRequiredActions(flag: FraudFlag): FraudAction[] {
    const actions: FraudAction[] = [];

    // Based on severity, determine what actions need to be taken
    switch (flag.severity) {
      case 'critical':
      case 'high':
        actions.push({
          type: 'manager_pin',
          timestamp: new Date(),
          target: flag.posDeviceId,
          payload: {
            flagId: flag.id,
            reason: flag.description
          },
          success: false // Will be updated when executed
        });
        break;

      case 'medium':
        actions.push({
          type: 'toast',
          timestamp: new Date(),
          target: flag.posDeviceId,
          payload: {
            message: `Fraud Alert: ${flag.description}`,
            severity: 'warning'
          },
          success: false
        });
        break;

      case 'low':
        actions.push({
          type: 'log',
          timestamp: new Date(),
          target: 'system',
          payload: {
            flagId: flag.id,
            message: flag.description
          },
          success: true
        });
        break;
    }

    return actions;
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const now = new Date();
      const staleThreshold = new Date(now.getTime() - this.config.heartbeatInterval * 2);

      // Check for stale connections
      this.clients.forEach((client, clientId) => {
        if (client.lastPing && client.lastPing < staleThreshold) {
          this.logger.warn('Removing stale connection', { clientId });
          this.disconnectClient(clientId, 'Heartbeat timeout');
        } else if (client.ws.readyState === WebSocket.OPEN) {
          // Send ping
          client.ws.ping();
        }
      });

    }, this.config.heartbeatInterval);
  }

  /**
   * Get connected clients statistics
   */
  public getConnectionStats(): any {
    const stats = {
      total: this.clients.size,
      byType: {
        pos: 0,
        dashboard: 0,
        manager: 0
      },
      byBranch: {} as Record<string, number>
    };

    this.clients.forEach(client => {
      stats.byType[client.type]++;
      
      if (client.branchId) {
        stats.byBranch[client.branchId] = (stats.byBranch[client.branchId] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Shutdown WebSocket server
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down WebSocket service...');

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    // Close all client connections
    this.clients.forEach((client, clientId) => {
      client.ws.close(1001, 'Server shutting down');
    });
    this.clients.clear();

    // Close WebSocket server
    if (this.wss) {
      return new Promise((resolve) => {
        this.wss!.close(() => {
          this.logger.info('WebSocket server closed');
          resolve();
        });
      });
    }
  }
} 