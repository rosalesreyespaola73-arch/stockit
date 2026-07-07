import { db } from '../db.js';

// GET /api/bodega -> Devuelve la ubicación configurada
export const getBodega = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM bodega_config LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Configuración de bodega no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/bodega -> Actualiza (calibra) las coordenadas
export const updateBodega = async (req, res) => {
  const { latitud, longitud } = req.body;

  if (!latitud || !longitud) {
    return res.status(400).json({ message: 'Latitud y longitud son requeridas' });
  }

  try {
    await db.execute(
      'UPDATE bodega_config SET latitud = ?, longitud = ?, actualizado_en = NOW() WHERE id = 1',
      [latitud, longitud]
    );
    res.json({ message: 'Bodega calibrada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};