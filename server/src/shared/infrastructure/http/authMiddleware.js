import { UnauthorizedError } from '../../domain/errors/index.js';
import { SQLiteUserRepository } from '../../../modules/users/infrastructure/SQLiteUserRepository.js';
import { JwtTokenService } from '../../../modules/users/infrastructure/JwtTokenService.js';

const userRepository = new SQLiteUserRepository();
const tokenService = new JwtTokenService();

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verify(token);
    if (!payload || !payload.id) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    const user = await userRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedError('User does not exist');
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    next(error);
  }
}
