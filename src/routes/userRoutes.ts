import express from 'express';
import * as userController from '../controllers/userController';
const router = express.Router();

router.post('/register', userController.register);
router.get('/verification', userController.verification);
router.get('/list', userController.getAllUsers);
export default router;
