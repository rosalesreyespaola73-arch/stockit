import { db } from '../db.js';
import { rutaArchivo } from '../middlewares/upload.js';

// GET /api/productos
export const getProductos = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM productos ORDER BY prod_nombre');
    res.json(rows);
  } catch (error) {
    console.error('Error en getProductos:', error);
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
  }
};

// GET /api/productos/alertas
export const getProductosBajoStock = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM productos WHERE prod_stock <= prod_stock_minimo ORDER BY prod_stock ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en getProductosBajoStock:', error);
    res.status(500).json({ error: 'Error al obtener alertas', details: error.message });
  }
};

// GET /api/productos/:id
export const getProductoPorId = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM productos WHERE prod_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getProductoPorId:', error);
    res.status(500).json({ error: 'Error al obtener producto', details: error.message });
  }
};

// POST /api/productos (Genera el código automáticamente)
export const postProducto = async (req, res) => {
  const { prod_nombre, prod_descripcion, prod_stock, prod_stock_minimo } = req.body;

  try {
    // Validar nombre (obligatorio)
    if (!prod_nombre || prod_nombre.trim() === '' || prod_nombre === 'undefined') {
      return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
    }

    const prod_imagen = req.file ? rutaArchivo(req.file) : null;

    // Generar código automático de forma segura
    const [rows] = await db.execute(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(prod_codigo, 5) AS UNSIGNED)), 0) as max_num 
       FROM productos 
       WHERE prod_codigo LIKE 'PRD-%'`
    );

    const lastNum = rows[0]?.max_num || 0;
    const prod_codigo = `PRD-${String(lastNum + 1).padStart(3, '0')}`;

    // Limpiar campos que vienen de FormData
    const descripcionLimpia = (!prod_descripcion || prod_descripcion === 'undefined') ? '' : prod_descripcion.trim();
    const stockLimpio = isNaN(Number(prod_stock)) ? 0 : Number(prod_stock);
    const stockMinLimpio = isNaN(Number(prod_stock_minimo)) ? 5 : Number(prod_stock_minimo);

    // Insertar producto
    const [result] = await db.execute(
      `INSERT INTO productos (prod_codigo, prod_nombre, prod_descripcion, prod_stock, prod_stock_minimo, prod_imagen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        prod_codigo,
        prod_nombre.trim(),
        descripcionLimpia,
        stockLimpio,
        stockMinLimpio,
        prod_imagen
      ]
    );

    res.status(201).json({
      prod_id: result.insertId,
      prod_codigo,
      message: 'Producto creado exitosamente'
    });

  } catch (error) {
    console.error('Error en postProducto:', error);
    res.status(500).json({ error: 'Error al crear producto', details: error.message });
  }
};

// PUT /api/productos/:id
export const putProducto = async (req, res) => {
  const { prod_codigo, prod_nombre, prod_descripcion, prod_stock, prod_stock_minimo } = req.body;
  const { id } = req.params;

  try {
    // Validar nombre (obligatorio)
    if (!prod_nombre || prod_nombre.trim() === '' || prod_nombre === 'undefined') {
      return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
    }

    // Validar que el producto existe
    const [existing] = await db.execute(
      'SELECT prod_id, prod_imagen FROM productos WHERE prod_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Determinar imagen
    let prod_imagen = existing[0].prod_imagen;
    if (req.file) {
      prod_imagen = rutaArchivo(req.file);
    }

    // Limpiar campos que vienen de FormData
    const descripcionLimpia = (!prod_descripcion || prod_descripcion === 'undefined') ? '' : prod_descripcion.trim();
    const stockLimpio = isNaN(Number(prod_stock)) ? 0 : Number(prod_stock);
    const stockMinLimpio = isNaN(Number(prod_stock_minimo)) ? 5 : Number(prod_stock_minimo);
    const codigoLimpio = (!prod_codigo || prod_codigo === 'undefined') ? '' : prod_codigo.trim();

    // Actualizar producto
    await db.execute(
      `UPDATE productos 
       SET prod_codigo = ?, prod_nombre = ?, prod_descripcion = ?, prod_stock = ?, prod_stock_minimo = ?, prod_imagen = ?
       WHERE prod_id = ?`,
      [
        codigoLimpio,
        prod_nombre.trim(),
        descripcionLimpia,
        stockLimpio,
        stockMinLimpio,
        prod_imagen,
        id
      ]
    );

    res.json({ message: 'Producto actualizado exitosamente' });

  } catch (error) {
    console.error('Error en putProducto:', error);
    res.status(500).json({ error: 'Error al actualizar producto', details: error.message });
  }
};

// DELETE /api/productos/:id
export const deleteProducto = async (req, res) => {
  try {
    const [existing] = await db.execute(
      'SELECT prod_id FROM productos WHERE prod_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await db.execute('DELETE FROM productos WHERE prod_id = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado exitosamente' });

  } catch (error) {
    console.error('Error en deleteProducto:', error);
    res.status(500).json({ error: 'Error al eliminar producto', details: error.message });
  }
};