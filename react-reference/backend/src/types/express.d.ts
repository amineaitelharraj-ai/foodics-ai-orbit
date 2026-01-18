import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Correlated request id injected by request-id middleware
     */
    requestId?: string;
  }
}
