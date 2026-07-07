// =====================================================================
//  SEED: crea los usuarios iniciales con contraseña ENCRIPTADA (bcrypt).
//  Ejecutar UNA vez, después de correr el stockit.sql:
//     npm run seed
// =====================================================================
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const usuarios = [
  { nombre: 'Administrador', correo: 'admin@stockit.com',     password: 'admin123',     rol: 'admin' },
  { nombre: 'Juan Encargado', correo: 'encargado@stockit.com', password: 'encargado123', rol: 'encargado' },
  { nombre: 'Pedro Técnico',  correo: 'tecnico@stockit.com',   password: 'tecnico123',   rol: 'tecnico' }
];

async function seed() {
  try {
    for (const u of usuarios) {
      const [existe] = await db.execute('SELECT usu_id FROM usuarios WHERE usu_correo = ?', [u.correo]);
      if (existe.length > 0) {
        console.log(`  Ya existe: ${u.correo}`);
        continue;
      }
      const hash = await bcrypt.hash(u.password, 10);
      const [result] = await db.execute(
        'INSERT INTO usuarios (usu_nombre, usu_correo, usu_password, usu_rol) VALUES (?, ?, ?, ?)',
        [u.nombre, u.correo, hash, u.rol]
      );
      const qr = `${u.rol.toUpperCase()}-${result.insertId}`;
      await db.execute('UPDATE usuarios SET usu_qr = ? WHERE usu_id = ?', [qr, result.insertId]);
      console.log(`Creado: ${u.correo} (clave: ${u.password}) | QR: ${qr}`);
    }
    console.log('\n Seed completado. Ya puedes iniciar sesión.');
    process.exit(0);
  } catch (error) {
    console.error(' Error en el seed:', error.message);
    process.exit(1);
  }
}

seed();
