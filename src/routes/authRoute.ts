import express from 'express';
import * as authController from '../controllers/authController';
const router = express.Router();

router.post('/login', authController.Login);
router.get('/logout', authController.Logout)
export default router;
