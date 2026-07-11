import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT, DB_SSL } from './config.js';

// Un solo pool de conexiones reutilizable en toda la app
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
  ssl: DB_SSL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificamos la conexión al arrancar
pool.getConnection()
  .then(connection => {
    console.log(`Conectado a la base de datos: ${DB_DATABASE} en ${DB_HOST}`);
    connection.release();
  })
  .catch(err => {
    console.error(' Error de conexión a la base de datos:', err.message);
  });

export const db = pool;
export default pool;
