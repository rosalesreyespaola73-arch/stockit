import { Router } from 'express';
import {
  getUsuarios, getUsuarioPorQR, postUsuario, putUsuario, deleteUsuario
} from '../controladores/usuariosCtrl.js';
import { verificarToken, soloRoles } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Buscar técnico por su QR (lo usa la pantalla de escaneo)
router.get('/usuarios/qr/:codigo', verificarToken, getUsuarioPorQR);

router.get('/usuarios', verificarToken, getUsuarios);
// Crear/editar aceptan una foto en el campo "foto"
router.post('/usuarios', verificarToken, soloRoles('admin'), upload.single('foto'), postUsuario);
router.put('/usuarios/:id', verificarToken, soloRoles('admin'), upload.single('foto'), putUsuario);
router.delete('/usuarios/:id', verificarToken, soloRoles('admin'), deleteUsuario);

export default router;
