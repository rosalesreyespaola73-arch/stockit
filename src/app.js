import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bodegaRouter from './routers/bodega.routers.js';

import authRouter from './routers/auth.routers.js';
import usuariosRouter from './routers/usuarios.routers.js';
import productosRouter from './routers/productos.routers.js';
import activosRouter from './routers/activos.routers.js';
import movimientosRouter from './routers/movimientos.routers.js';
import dashboardRouter from './routers/dashboard.routers.js';
import solicitudesRouter from './routers/solicitudes.routers.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// CORS abierto: acepta la app desde cualquier puerto o celular
// (usamos token JWT en el header, no cookies, por eso no va credentials)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API de STOCKIT funcionando ' });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API STOCKIT activa',
    endpoints: {
      login: 'POST /api/login',
      usuarios: '/api/usuarios',
      productos: '/api/productos',
      activos: '/api/activos',
      movimientos: '/api/movimientos'
    }
  });
});

app.use('/api', authRouter);
app.use('/api', usuariosRouter);
app.use('/api', productosRouter);
app.use('/api', activosRouter);
app.use('/api', movimientosRouter);
app.use('/api', dashboardRouter);
app.use('/api', bodegaRouter);
app.use('/api', solicitudesRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint no encontrado' });
});

export default app;
