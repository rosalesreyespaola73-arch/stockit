import { Router } from 'express';
import { getBodega, updateBodega } from '../controladores/bodega.Ctrl.js';
import { verificarToken, soloRoles } from '../middlewares/auth.js';

const router = Router();

// Consultar ubicación (cualquier técnico logueado puede ver dónde está la bodega)
router.get('/bodega', verificarToken, getBodega);

// Calibrar/Actualizar (SOLO administradores o encargados pueden cambiar la ubicación)
router.put('/bodega', verificarToken, soloRoles('admin', 'encargado'), updateBodega);

export default router;