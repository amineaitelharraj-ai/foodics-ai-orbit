/**
 * Logging Utility for Fraud Detection Backend
 * 
 * Provides structured logging with multiple transports and proper error handling.
 * Uses Winston for robust logging capabilities.
 */

import winston from 'winston';
import path from 'path';

export interface LogContext {
  [key: string]: any;
}

export interface Logger {
  error(message: string, context?: LogContext | Error): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  verbose(message: string, context?: LogContext): void;
}

/**
 * Custom logger implementation using Winston
 */
class FraudDetectionLogger implements Logger {
  private winston: winston.Logger;

  constructor() {
    this.winston = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          ...meta
        });
      })
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss'
      }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length > 0 ? 
          `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} [${level}]: ${message}${metaString}`;
      })
    );

    const transports: winston.transport[] = [];

    // Console transport for development
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          level: process.env.LOG_LEVEL || 'debug',
          format: consoleFormat,
          handleExceptions: true
        })
      );
    }

    // File transports for production
    if (process.env.NODE_ENV === 'production' || process.env.LOG_FILE_PATH) {
      const logDir = path.dirname(process.env.LOG_FILE_PATH || './logs/fraud-service.log');
      
      // Error log file
      transports.push(
        new winston.transports.File({
          level: 'error',
          filename: path.join(logDir, 'error.log'),
          format: logFormat,
          maxsize: parseInt(process.env.LOG_MAX_SIZE || '10485760'), // 10MB
          maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
          handleExceptions: true
        })
      );

      // Combined log file
      transports.push(
        new winston.transports.File({
          level: process.env.LOG_LEVEL || 'info',
          filename: path.join(logDir, 'combined.log'),
          format: logFormat,
          maxsize: parseInt(process.env.LOG_MAX_SIZE || '10485760'), // 10MB
          maxFiles: parseInt(process.env.LOG_MAX_FILES || '5')
        })
      );
    }

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports,
      exitOnError: false,
      silent: process.env.NODE_ENV === 'test'
    });
  }

  error(message: string, context?: LogContext | Error): void {
    if (context instanceof Error) {
      this.winston.error(message, { 
        error: {
          name: context.name,
          message: context.message,
          stack: context.stack
        }
      });
    } else {
      this.winston.error(message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    this.winston.warn(message, context);
  }

  info(message: string, context?: LogContext): void {
    this.winston.info(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.winston.debug(message, context);
  }

  verbose(message: string, context?: LogContext): void {
    this.winston.verbose(message, context);
  }
}

// Singleton logger instance
let loggerInstance: Logger | null = null;

/**
 * Get the singleton logger instance
 */
export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new FraudDetectionLogger();
  }
  return loggerInstance;
}

/**
 * Create a child logger with default context
 */
export function createChildLogger(defaultContext: LogContext): Logger {
  const parentLogger = getLogger();
  
  return {
    error: (message: string, context?: LogContext | Error) => {
      const combinedContext = context instanceof Error ? 
        { ...defaultContext, error: context } :
        { ...defaultContext, ...context };
      parentLogger.error(message, combinedContext);
    },
    warn: (message: string, context?: LogContext) => {
      parentLogger.warn(message, { ...defaultContext, ...context });
    },
    info: (message: string, context?: LogContext) => {
      parentLogger.info(message, { ...defaultContext, ...context });
    },
    debug: (message: string, context?: LogContext) => {
      parentLogger.debug(message, { ...defaultContext, ...context });
    },
    verbose: (message: string, context?: LogContext) => {
      parentLogger.verbose(message, { ...defaultContext, ...context });
    }
  };
}

/**
 * Create request-scoped logger with request ID
 */
export function createRequestLogger(requestId: string): Logger {
  return createChildLogger({ requestId });
}

/**
 * Logger middleware for Express
 */
export function createLoggingMiddleware() {
  const logger = getLogger();
  
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const requestId = req.requestId || 'unknown';
    
    // Log incoming request
    logger.info('Incoming request', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      const duration = Date.now() - startTime;
      
      logger.info('Request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration
      });

      originalEnd.apply(res, args);
    };

    next();
  };
}

// Export the logger instance as default
export default getLogger(); 