import { Router } from 'express';
import {
  getProductos, getProductosBajoStock, getProductoPorId,
  postProducto, putProducto, deleteProducto
} from '../controladores/productosCtrl.js';
import { verificarToken, soloRoles } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.get('/productos/alertas', verificarToken, getProductosBajoStock);
router.get('/productos', verificarToken, getProductos);
router.get('/productos/:id', verificarToken, getProductoPorId);

// Crear/editar aceptan una imagen (campo "imagen")
router.post('/productos', verificarToken, soloRoles('admin', 'encargado'), upload.single('imagen'), postProducto);
router.put('/productos/:id', verificarToken, soloRoles('admin', 'encargado'), upload.single('imagen'), putProducto);
router.delete('/productos/:id', verificarToken, soloRoles('admin'), deleteProducto);

export default router;
