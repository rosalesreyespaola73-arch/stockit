import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { JWT_SECRET } from '../config.js';

// POST /api/login  -> valida correo + contraseña contra la base de datos
export const login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE usu_correo = ? AND usu_activo = 1',
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    // Comparamos la contraseña escrita con el hash guardado
    const passwordOk = await bcrypt.compare(password, usuario.usu_password);
    if (!passwordOk) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generamos el token con los datos del usuario
    const token = jwt.sign(
      { id: usuario.usu_id, nombre: usuario.usu_nombre, rol: usuario.usu_rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.usu_id,
        nombre: usuario.usu_nombre,
        correo: usuario.usu_correo,
        rol: usuario.usu_rol,
        qr: usuario.usu_qr
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/recuperar  -> restablece la contraseña por correo.
// NOTA: es una versión sencilla para el proyecto (sin envío de email).
// Verifica que el correo exista y guarda la nueva contraseña encriptada.
export const recuperarPassword = async (req, res) => {
  const { correo, nuevaPassword } = req.body;
  if (!correo || !nuevaPassword) {
    return res.status(400).json({ message: 'Correo y nueva contraseña son obligatorios' });
  }
  if (nuevaPassword.length < 4) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres' });
  }
  try {
    const [rows] = await db.execute('SELECT usu_id FROM usuarios WHERE usu_correo = ?', [correo]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No existe una cuenta con ese correo' });
    }
    const hash = await bcrypt.hash(nuevaPassword, 10);
    await db.execute('UPDATE usuarios SET usu_password = ? WHERE usu_correo = ?', [hash, correo]);
    res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
