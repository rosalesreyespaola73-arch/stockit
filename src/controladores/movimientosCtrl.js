import { db } from '../db.js';

// GET /api/movimientos  -> historial general con nombres de técnico y encargado
export const getMovimientos = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT m.*, p.prod_nombre, t.usu_nombre AS tecnico, e.usu_nombre AS encargado
       FROM movimientos m
       LEFT JOIN productos p ON m.prod_id = p.prod_id
       LEFT JOIN usuarios t ON m.tecnico_id = t.usu_id
       LEFT JOIN usuarios e ON m.encargado_id = e.usu_id
       ORDER BY m.mov_fecha DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/mis-prestamos -> salidas del técnico logueado (herramientas que tiene).
// Usa el id que viene dentro del token (req.user.id).
export const getMisPrestamos = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT m.*, p.prod_nombre, a.act_numero_serie, a.act_marca, a.act_modelo, a.act_estado
       FROM movimientos m
       LEFT JOIN productos p ON m.prod_id = p.prod_id
       LEFT JOIN activos_individuales a ON m.act_id = a.act_id
       WHERE m.tecnico_id = ? AND m.mov_tipo = 'salida'
       ORDER BY m.mov_fecha DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/prestamos-pendientes -> lo que REALMENTE sigue prestado.
// Por cada producto+técnico calcula:  salidas - entradas.
// Si el resultado es > 0, todavía hay algo sin devolver (aparece en la lista).
// Cuando se registra la devolución (entrada), el saldo llega a 0 y DESAPARECE.
export const getPrestamosPendientes = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         m.prod_id,
         m.tecnico_id,
         p.prod_nombre,
         p.prod_imagen,
         t.usu_nombre AS tecnico,
         SUM(CASE WHEN m.mov_tipo = 'salida'  THEN m.mov_cantidad ELSE 0 END) -
         SUM(CASE WHEN m.mov_tipo = 'entrada' THEN m.mov_cantidad ELSE 0 END) AS pendiente,
         MAX(m.mov_fecha) AS ultima_fecha
       FROM movimientos m
       LEFT JOIN productos p ON m.prod_id = p.prod_id
       LEFT JOIN usuarios  t ON m.tecnico_id = t.usu_id
       WHERE m.tecnico_id IS NOT NULL
       GROUP BY m.prod_id, m.tecnico_id, p.prod_nombre, p.prod_imagen, t.usu_nombre
       HAVING pendiente > 0
       ORDER BY ultima_fecha DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/movimientos  -> registra una entrada o salida.
// El TRIGGER de la base de datos ajusta el stock automáticamente.
// La firma digital viaja en Base64 dentro de mov_firma.
export const postMovimiento = async (req, res) => {
  const { prod_id, act_id, mov_tipo, mov_cantidad, encargado_id, tecnico_id, mov_firma } = req.body;

  if (!prod_id || !mov_tipo) {
    return res.status(400).json({ message: 'prod_id y mov_tipo son obligatorios' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO movimientos
        (prod_id, act_id, mov_tipo, mov_cantidad, encargado_id, tecnico_id, mov_firma)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [prod_id, act_id || null, mov_tipo, mov_cantidad || 1, encargado_id || null, tecnico_id || null, mov_firma || null]
    );

    // Si movió una herramienta, actualizamos su estado
    if (act_id) {
      const nuevoEstado = mov_tipo === 'salida' ? 'En Préstamo' : 'Disponible';
      await db.execute('UPDATE activos_individuales SET act_estado = ? WHERE act_id = ?', [nuevoEstado, act_id]);
    }

    res.status(201).json({ mov_id: result.insertId, message: 'Movimiento registrado (stock actualizado por el trigger)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
