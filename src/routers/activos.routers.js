import { Router } from 'express';
import {
  getActivos, getActivoPorId, getHistorialActivo,
  postActivo, putActivo, deleteActivo
} from '../controladores/activosCtrl.js';
import { verificarToken, soloRoles } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Aceptan foto (campo "foto") y manual PDF (campo "manual")
const archivos = upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'manual', maxCount: 1 }
]);

router.get('/activos', verificarToken, getActivos);
router.get('/activos/:id', verificarToken, getActivoPorId);
router.get('/activos/:id/historial', verificarToken, getHistorialActivo);

router.post('/activos', verificarToken, soloRoles('admin', 'encargado'), archivos, postActivo);
router.put('/activos/:id', verificarToken, soloRoles('admin', 'encargado'), archivos, putActivo);
router.delete('/activos/:id', verificarToken, soloRoles('admin'), deleteActivo);

export default router;
