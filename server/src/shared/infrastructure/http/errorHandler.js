import { DomainError } from '../../domain/errors/index.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.message,
      type: err.name
    });
  }

  console.error('Unhandled Error:', err);
  return res.status(500).json({
    error: 'Internal server error',
    type: 'InternalServerError'
  });
}
