import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Guardado local (carpeta /uploads) - es el valor por defecto
const storageLocal = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});

let storage = storageLocal;

// Si hay Cloudinary configurado lo intentamos; si algo falla, seguimos en local
// (asi el servidor nunca se cae por culpa de Cloudinary)
if (process.env.CLOUDINARY_URL) {
  try {
    const { v2: cloudinary } = await import('cloudinary');
    const { CloudinaryStorage } = await import('multer-storage-cloudinary');
    cloudinary.config();
    storage = new CloudinaryStorage({ cloudinary, params: { folder: 'stockit', resource_type: 'auto' } });
    console.log('Imagenes: usando Cloudinary (nube)');
  } catch (e) {
    console.warn('Cloudinary no disponible, se guarda en local:', e.message);
    storage = storageLocal;
  }
}

// Devuelve la ruta correcta: URL completa si es Cloudinary, o /uploads/... si es local
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
