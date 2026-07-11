import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===== ALMACENAMIENTO LOCAL (FALLBACK) =====
const storageLocal = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

let storage = storageLocal;
let usingCloudinary = false;

// ===== CLOUDINARY (SI ESTÁ CONFIGURADO) =====
if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.includes('your_api_key')) {
  try {
    const { v2: cloudinary } = await import('cloudinary');
    const { CloudinaryStorage } = await import('multer-storage-cloudinary');

    // Configurar Cloudinary con la URL del .env
    cloudinary.config();

    // Crear storage de Cloudinary
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'stockit',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf']
      }
    });

    usingCloudinary = true;
    console.log(' Almacenamiento: Cloudinary (nube, permanente)');
  } catch (error) {
    console.warn('Cloudinary falló, usando almacenamiento local:', error.message);
    storage = storageLocal;
    usingCloudinary = false;
  }
}

// ===== PROCESAR RUTA DEL ARCHIVO =====
/**
 * Retorna la ruta que se guarda en la BD
 * - Cloudinary: URL completa (https://...)
 * - Local: ruta relativa (/uploads/...)
 */
export const rutaArchivo = (file) => {
  if (!file) return null;

  // Si Cloudinary devuelve file.path (URL completa)
  if (file.path && /^https?:\/\//.test(file.path)) {
    return file.path;
  }

  // Si es almacenamiento local
  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  return null;
};

// ===== FILTRO DE ARCHIVOS =====
const fileFilter = (req, file, cb) => {
  const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  if (permitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan JPG, PNG, WebP o PDF`));
  }
};

// ===== CONFIGURACIÓN DE MULTER =====
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// ===== ESTADO (PARA DEBUGGING) =====
export const getStorageInfo = () => {
  return {
    usando: usingCloudinary ? 'Cloudinary' : 'Local',
    cloudinaryConfigured: !!process.env.CLOUDINARY_URL,
    maxFileSize: '10 MB',
    formatosPermitidos: ['JPG', 'PNG', 'WebP', 'PDF']
  };
};