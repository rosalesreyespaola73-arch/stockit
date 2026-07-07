import { Router } from 'express';
import { getMovimientos, postMovimiento, getMisPrestamos } from '../controladores/movimientosCtrl.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.get('/movimientos', verificarToken, getMovimientos);
// Herramientas que tiene el técnico logueado (app del empleado)
router.get('/mis-prestamos', verificarToken, getMisPrestamos);
// El encargado registra la salida/entrada (con firma del técnico)
router.post('/movimientos', verificarToken, soloRolesEncargado, postMovimiento);

// pequeño guard inline: solo admin o encargado registran movimientos
function soloRolesEncargado(req, res, next) {
  if (req.user && ['admin', 'encargado'].includes(req.user.rol)) return next();
  return res.status(403).json({ message: 'Solo un encargado puede registrar movimientos' });
}

export default router;
