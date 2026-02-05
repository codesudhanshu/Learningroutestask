import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes (would add auth middleware later)
// router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;