import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Guardado local (por defecto). En Render gratis las fotos locales se borran
// al reiniciar; por eso lo ideal es Cloudinary (mas abajo).
const storageLocal = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});

let storage = storageLocal;

// Si hay una CLOUDINARY_URL REAL, guardamos las fotos en la nube (permanentes).
// Si algo falla, seguimos en local para que el servidor no se caiga.
if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.includes('your_api_key')) {
  try {
    const { v2: cloudinary } = await import('cloudinary');
    const { CloudinaryStorage } = await import('multer-storage-cloudinary');
    cloudinary.config();
    storage = new CloudinaryStorage({ cloudinary, params: { folder: 'stockit', resource_type: 'auto' } });
    console.log('Imagenes: Cloudinary (nube, permanentes)');
  } catch (e) {
    console.warn('Cloudinary no disponible, se guarda en local:', e.message);
    storage = storageLocal;
  }
}

// Ruta que se guarda en la base de datos.
// Cloudinary devuelve una URL completa (https://...); local devuelve /uploads/...
export const rutaArchivo = (file) => {
  if (!file) return null;
  if (file.path && /^https?:\/\//.test(file.path)) return file.path;
  return `/uploads/${file.filename}`;
};

const fileFilter = (req, file, cb) => {
  const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (permitidos.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Solo se permiten imagenes (jpg, png, webp) o PDF'));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
