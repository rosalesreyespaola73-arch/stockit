import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Busca el .env tanto en backend/ como en backend/src/ (así lo encuentra siempre)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });
config({ path: path.resolve(__dirname, '.env') });
config(); // por si está en la carpeta desde donde se ejecuta

// Puerto de la API (Render inyecta su propio PORT automáticamente)
export const PORT = process.env.PORT || 3000;

// Clave para firmar los tokens JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'clave_maestra_stockit_2026';

// Datos de conexión a la base de datos
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_DATABASE = process.env.DB_DATABASE || 'stockit';
export const DB_PORT = parseInt(process.env.DB_PORT) || 3306;

// SSL: Aiven y la mayoría de nubes lo exigen. Local normalmente no.
export const DB_SSL =
  process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null;
