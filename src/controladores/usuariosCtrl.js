import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { rutaArchivo } from '../middlewares/upload.js';

// GET /api/usuarios  -> lista todos (sin la contraseña, con su foto)
export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT usu_id, usu_nombre, usu_correo, usu_rol, usu_qr, usu_foto, usu_activo, created_at FROM usuarios'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/usuarios/qr/:codigo  -> busca por su codigo QR (ej: TECNICO-5)
export const getUsuarioPorQR = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT usu_id, usu_nombre, usu_correo, usu_rol, usu_qr, usu_foto FROM usuarios WHERE usu_qr = ?',
      [req.params.codigo]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Tecnico no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/usuarios  -> crea usuario (con foto opcional)
export const postUsuario = async (req, res) => {
  const { nombre, correo, password, rol } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ message: 'Nombre, correo y contrasena son obligatorios' });
  }

  try {
    const [existe] = await db.execute('SELECT usu_id FROM usuarios WHERE usu_correo = ?', [correo]);
    if (existe.length > 0) return res.status(400).json({ message: 'El correo ya esta registrado' });

    const hash = await bcrypt.hash(password, 10);
    const usu_foto = rutaArchivo(req.file);

    const [result] = await db.execute(
      'INSERT INTO usuarios (usu_nombre, usu_correo, usu_password, usu_rol, usu_foto) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, hash, rol || 'tecnico', usu_foto]
    );

    // El QR se arma con el rol y el id: ej TECNICO-5
    const codigoQR = `${(rol || 'tecnico').toUpperCase()}-${result.insertId}`;
    await db.execute('UPDATE usuarios SET usu_qr = ? WHERE usu_id = ?', [codigoQR, result.insertId]);

    res.status(201).json({ usu_id: result.insertId, usu_qr: codigoQR, message: 'Usuario creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/usuarios/:id  -> actualiza datos (foto y contrasena opcionales)
export const putUsuario = async (req, res) => {
  const { nombre, correo, rol, password, activo } = req.body;
  try {
    // Si suben foto nueva la usamos; si no, mantenemos la actual
    let usu_foto = null;
    if (req.file) {
      usu_foto = rutaArchivo(req.file);
    } else {
      const [act] = await db.execute('SELECT usu_foto FROM usuarios WHERE usu_id = ?', [req.params.id]);
      usu_foto = act[0]?.usu_foto || null;
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.execute(
        'UPDATE usuarios SET usu_nombre=?, usu_correo=?, usu_rol=?, usu_password=?, usu_foto=?, usu_activo=? WHERE usu_id=?',
        [nombre, correo, rol, hash, usu_foto, activo ?? 1, req.params.id]
      );
    } else {
      await db.execute(
        'UPDATE usuarios SET usu_nombre=?, usu_correo=?, usu_rol=?, usu_foto=?, usu_activo=? WHERE usu_id=?',
        [nombre, correo, rol, usu_foto, activo ?? 1, req.params.id]
      );
    }
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/usuarios/:id
export const deleteUsuario = async (req, res) => {
  try {
    await db.execute('DELETE FROM usuarios WHERE usu_id = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
