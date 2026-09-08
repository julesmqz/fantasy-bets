import { ValidationError, ConflictError } from '../../../shared/domain/errors/index.js';

export class RegisterUser {
  constructor({ userRepository, hashService, tokenService }) {
    this.userRepository = userRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  async execute({ username, email, password }) {
    if (!username || !email || !password) {
      throw new ValidationError('Username, email, and password are required');
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      throw new ValidationError('Username must be at least 3 characters');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const existingEmail = await this.userRepository.findByEmail(trimmedEmail);
    if (existingEmail) {
      throw new ConflictError('Email is already registered');
    }

    const existingUsername = await this.userRepository.findByUsername(trimmedUsername);
    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }

    const passwordHash = await this.hashService.hash(password);
    const user = await this.userRepository.create({
      username: trimmedUsername,
      email: trimmedEmail,
      passwordHash
    });

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
