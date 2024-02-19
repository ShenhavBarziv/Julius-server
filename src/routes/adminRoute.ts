import express from 'express';
import * as adminController from '../controllers/adminController';
const router = express.Router();

router.get('/approve', adminController.list);
router.post('/approve', adminController.approve);
router.delete('/approve', adminController.deleteReg);

router.delete('/manage', adminController.deleteUser)
router.put('/manage', adminController.updateUser)
router.get('/manage', adminController.fetchUser)
export default router;
