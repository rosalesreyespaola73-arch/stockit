import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

// Verifica que venga un token válido en el header Authorization: Bearer xxx
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, nombre, rol }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Permite el paso solo a ciertos roles. Ej: soloRoles('admin','encargado')
export const soloRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return res.status(403).json({ message: 'No tienes permiso para esta acción' });
  }
  next();
};
