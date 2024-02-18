import express from 'express';
import { Login } from '../controllers/authController';
const router = express.Router();

router.post('/login', Login);
export default router;
