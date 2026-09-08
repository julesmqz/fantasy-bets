import { Router } from 'express';
import { FirestoreUserRepository } from '../FirestoreUserRepository.js';
import { BcryptHashService } from '../BcryptHashService.js';
import { JwtTokenService } from '../JwtTokenService.js';
import { RegisterUser } from '../../application/RegisterUser.js';
import { LoginUser } from '../../application/LoginUser.js';
import { VerifyToken } from '../../application/VerifyToken.js';
import { AuthController } from './AuthController.js';
import { authMiddleware } from '../../../../shared/infrastructure/http/authMiddleware.js';

export function createAuthRouter() {
  const router = Router();

  const userRepository = new FirestoreUserRepository();
  const hashService = new BcryptHashService();
  const tokenService = new JwtTokenService();

  const registerUser = new RegisterUser({ userRepository, hashService, tokenService });
  const loginUser = new LoginUser({ userRepository, hashService, tokenService });
  const verifyToken = new VerifyToken({ userRepository, tokenService });

  const authController = new AuthController({ registerUser, loginUser, verifyToken });

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.get('/me', authMiddleware, authController.me);

  return router;
}

export default createAuthRouter;
