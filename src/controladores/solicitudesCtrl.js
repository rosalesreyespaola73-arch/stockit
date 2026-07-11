import { db } from '../db.js';

// POST /api/solicitudes  -> el técnico solicita un producto.
// El tecnico_id sale del token (req.user.id).
export const crearSolicitud = async (req, res) => {
  const { prod_id, cantidad } = req.body;
  if (!prod_id) return res.status(400).json({ message: 'Falta el producto' });
  try {
    const [result] = await db.execute(
      'INSERT INTO solicitudes (prod_id, tecnico_id, sol_cantidad) VALUES (?, ?, ?)',
      [prod_id, req.user.id, cantidad || 1]
    );
    res.status(201).json({ sol_id: result.insertId, message: 'Solicitud enviada a bodega' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/solicitudes  -> la bodega ve las solicitudes (pendientes primero).
export const getSolicitudes = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, p.prod_nombre, p.prod_imagen, p.prod_stock, t.usu_nombre AS tecnico
       FROM solicitudes s
       LEFT JOIN productos p ON s.prod_id = p.prod_id
       LEFT JOIN usuarios  t ON s.tecnico_id = t.usu_id
       ORDER BY (s.sol_estado = 'pendiente') DESC, s.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/solicitudes/:id/atender  -> la bodega marca la solicitud como atendida.
export const atenderSolicitud = async (req, res) => {
  try {
    await db.execute("UPDATE solicitudes SET sol_estado = 'atendida' WHERE sol_id = ?", [req.params.id]);
    res.json({ message: 'Solicitud marcada como atendida' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};