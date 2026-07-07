import { Router } from 'express';
import {
  getUsuarios, getUsuarioPorQR, postUsuario, putUsuario, deleteUsuario
} from '../controladores/usuariosCtrl.js';
import { verificarToken, soloRoles } from '../middlewares/auth.js';

const router = Router();

// Buscar técnico por su QR (lo usa la pantalla de escaneo)
router.get('/usuarios/qr/:codigo', verificarToken, getUsuarioPorQR);

router.get('/usuarios', verificarToken, getUsuarios);
router.post('/usuarios', verificarToken, soloRoles('admin'), postUsuario);
router.put('/usuarios/:id', verificarToken, soloRoles('admin'), putUsuario);
router.delete('/usuarios/:id', verificarToken, soloRoles('admin'), deleteUsuario);

export default router;
