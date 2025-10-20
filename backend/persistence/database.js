import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Soporte para DATABASE_URL (Render, Heroku, etc.) o variables individuales
let sequelize;

if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL si está disponible (producción en Render)
  console.log('🔍 Usando DATABASE_URL para conexión');
  console.log('📍 DATABASE_URL (primeros 50 caracteres):', process.env.DATABASE_URL.substring(0, 50) + '...');
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  console.log('🔍 Usando variables individuales para conexión');
  console.log('📍 DB_HOST:', process.env.DB_HOST || 'localhost');
  console.log('📍 DB_NAME:', process.env.DB_NAME || 'parqueadero_db');
  // Usar variables individuales (desarrollo local)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'parqueadero_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

export default sequelize;