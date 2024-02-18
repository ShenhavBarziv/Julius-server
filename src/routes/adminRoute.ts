import express from 'express';
import * as adminController from '../controllers/adminController';
const router = express.Router();

router.get('/approve', adminController.list);
router.post('/approve', adminController.approve);
router.delete('/approve', adminController.deleteReg);
export default router;
