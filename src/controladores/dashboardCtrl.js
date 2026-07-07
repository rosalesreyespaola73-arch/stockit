import { db } from '../db.js';

// GET /api/dashboard/stats  -> números para las tarjetas de resumen del inicio
export const getStats = async (req, res) => {
  try {
    const [[productos]] = await db.query('SELECT COUNT(*) AS total FROM productos');
    const [[entradas]] = await db.query(
      `SELECT COUNT(*) AS total FROM movimientos
       WHERE mov_tipo = 'entrada'
         AND MONTH(mov_fecha) = MONTH(CURRENT_DATE())
         AND YEAR(mov_fecha) = YEAR(CURRENT_DATE())`
    );
    const [[salidas]] = await db.query(
      `SELECT COUNT(*) AS total FROM movimientos
       WHERE mov_tipo = 'salida'
         AND MONTH(mov_fecha) = MONTH(CURRENT_DATE())
         AND YEAR(mov_fecha) = YEAR(CURRENT_DATE())`
    );
    const [[alertas]] = await db.query(
      'SELECT COUNT(*) AS total FROM productos WHERE prod_stock <= prod_stock_minimo'
    );

    res.json({
      productos: productos.total,
      entradasMes: entradas.total,
      salidasMes: salidas.total,
      alertas: alertas.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
