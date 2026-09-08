export class AuthController {
  constructor({ registerUser, loginUser, verifyToken }) {
    this.registerUser = registerUser;
    this.loginUser = loginUser;
    this.verifyToken = verifyToken;
  }

  register = async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const result = await this.registerUser.execute({ username, email, password });
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await this.loginUser.execute({ email, password });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      return res.status(200).json({ user: req.user });
    } catch (error) {
      next(error);
    }
  };
}
