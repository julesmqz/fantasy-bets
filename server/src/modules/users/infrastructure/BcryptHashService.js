import bcrypt from 'bcryptjs';

export class BcryptHashService {
  constructor(saltRounds = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(plainPassword) {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
