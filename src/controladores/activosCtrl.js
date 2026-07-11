import { db } from '../db.js';
import { rutaArchivo } from '../middlewares/upload.js';

// GET /api/activos  -> lista todas las herramientas de valor
export const getActivos = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM activos_individuales ORDER BY act_numero_serie');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/activos/:id  -> detalle de una herramienta
export const getActivoPorId = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM activos_individuales WHERE act_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Activo no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/activos/:id/historial  -> movimientos de esa herramienta (para la pestaña Historial)
export const getHistorialActivo = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT m.*, t.usu_nombre AS tecnico, e.usu_nombre AS encargado
       FROM movimientos m
       LEFT JOIN usuarios t ON m.tecnico_id = t.usu_id
       LEFT JOIN usuarios e ON m.encargado_id = e.usu_id
       WHERE m.act_id = ?
       ORDER BY m.mov_fecha DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/activos  (acepta foto y/o manual PDF con multer .fields)
export const postActivo = async (req, res) => {
  const { act_numero_serie, act_marca, act_modelo, act_estado, act_estante, act_seccion, prod_id } = req.body;
  try {
    const foto = req.files?.foto ? rutaArchivo(req.files.foto[0]) : null;
    const manual = req.files?.manual ? rutaArchivo(req.files.manual[0]) : null;

    const [existe] = await db.execute(
      'SELECT act_id FROM activos_individuales WHERE act_numero_serie = ?',
      [act_numero_serie]
    );
    if (existe.length > 0) return res.status(400).json({ message: 'El número de serie ya existe' });

    const [result] = await db.execute(
      `INSERT INTO activos_individuales
        (act_numero_serie, act_marca, act_modelo, act_estado, act_estante, act_seccion, act_foto, act_manual_pdf, prod_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [act_numero_serie, act_marca || null, act_modelo || null, act_estado || 'Disponible',
       act_estante || null, act_seccion || null, foto, manual, prod_id || null]
    );
    res.status(201).json({ act_id: result.insertId, message: 'Activo creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/activos/:id
export const putActivo = async (req, res) => {
  const { act_numero_serie, act_marca, act_modelo, act_estado, act_estante, act_seccion, prod_id } = req.body;
  try {
    // Recuperamos foto/manual actuales para no perderlos si no suben nuevos
    const [actual] = await db.execute('SELECT act_foto, act_manual_pdf FROM activos_individuales WHERE act_id = ?', [req.params.id]);
    let foto = actual[0]?.act_foto || null;
    let manual = actual[0]?.act_manual_pdf || null;
    if (req.files?.foto) foto = rutaArchivo(req.files.foto[0]);
    if (req.files?.manual) manual = rutaArchivo(req.files.manual[0]);

    await db.execute(
      `UPDATE activos_individuales SET
        act_numero_serie=?, act_marca=?, act_modelo=?, act_estado=?, act_estante=?, act_seccion=?, act_foto=?, act_manual_pdf=?, prod_id=?
       WHERE act_id=?`,
      [act_numero_serie, act_marca, act_modelo, act_estado, act_estante, act_seccion, foto, manual, prod_id || null, req.params.id]
    );
    res.json({ message: 'Activo actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/activos/:id
export const deleteActivo = async (req, res) => {
  try {
    await db.execute('DELETE FROM activos_individuales WHERE act_id = ?', [req.params.id]);
    res.json({ message: 'Activo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
