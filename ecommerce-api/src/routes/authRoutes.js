import { Router } from 'express';
import { googleLogin } from '../controllers/authController.js';

const router = Router();

// POST /auth/google
router.post('/google', googleLogin);

export default router;
