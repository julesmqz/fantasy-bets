import { UnauthorizedError } from '../../../shared/domain/errors/index.js';

export class VerifyToken {
  constructor({ userRepository, tokenService }) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute(token) {
    if (!token) {
      throw new UnauthorizedError('Token is required');
    }

    const payload = this.tokenService.verify(token);
    if (!payload || !payload.id) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user.toJSON();
  }
}
