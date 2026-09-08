export class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends DomainError {
  constructor(message = 'Validation error') {
    super(message, 400);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}
