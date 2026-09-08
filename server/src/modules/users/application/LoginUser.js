import { ValidationError, UnauthorizedError } from '../../../shared/domain/errors/index.js';

export class LoginUser {
  constructor({ userRepository, hashService, tokenService }) {
    this.userRepository = userRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(trimmedEmail);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await this.hashService.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.tokenService.generate({
      id: user.id,
      username: user.username,
      email: user.email
    });

    return {
      user: user.toJSON(),
      token
    };
  }
}
