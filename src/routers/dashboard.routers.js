import { Router } from 'express';
import { getStats } from '../controladores/dashboardCtrl.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard/stats', verificarToken, getStats);

export default router;
