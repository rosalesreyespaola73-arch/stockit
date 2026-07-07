import { Router } from 'express';
import { crearSolicitud, getSolicitudes, atenderSolicitud } from '../controladores/solicitudesCtrl.js';
import { verificarToken, soloRoles } from '../middlewares/auth.js';

const router = Router();

// El técnico crea una solicitud
router.post('/solicitudes', verificarToken, crearSolicitud);
// La bodega (admin/encargado) ve y atiende las solicitudes
router.get('/solicitudes', verificarToken, soloRoles('admin', 'encargado'), getSolicitudes);
router.put('/solicitudes/:id/atender', verificarToken, soloRoles('admin', 'encargado'), atenderSolicitud);

export default router;