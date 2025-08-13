export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(
    message: string, 
    statusCode: number, 
    isOperational: boolean = true, 
    details?: any) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      this.details = details;
      Error.captureStackTrace(this);
    }
  }

    //Not Found error
    export class NotFoundError extends AppError {
      constructor(message = 'Resource not found') {
        super(message, 404);
      }
    }

    export class ValidationError extends AppError {
      constructor(message = 'Validation error', details?: any) {
        super(message, 400, true, details);
      }
    }

    export class AuthError extends AppError {
      constructor(message = 'Authentication error') {
        super(message, 401);
      }
    }
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database error', details?: any) {
    super(message, 500, true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 420);
  }
}   