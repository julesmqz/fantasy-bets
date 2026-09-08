import jwt from 'jsonwebtoken';

const DEFAULT_SECRET = 'fantasy-bets-super-secret-key-change-in-prod';

export class JwtTokenService {
  constructor(secret = process.env.JWT_SECRET || DEFAULT_SECRET, expiresIn = '7d') {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generate(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }
}
