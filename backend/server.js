import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './persistence/models.js';
import { authMiddleware, adminMiddleware } from './infrastructure/authMiddleware.js';
import { errorHandler, notFoundHandler } from './infrastructure/errorHandler.js';

// Importar controladores
import { AuthController } from './presentation/AuthController.js';
import { ParqueaderoController } from './presentation/ParqueaderoController.js';
import { EntradaController } from './presentation/EntradaController.js';
import { SalidaController } from './presentation/SalidaController.js';
import { ReporteController } from './presentation/ReporteController.js';

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Instanciar controladores
const authController = new AuthController();
const parqueaderoController = new ParqueaderoController();
const entradaController = new EntradaController();
const salidaController = new SalidaController();
const reporteController = new ReporteController();

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Parqueadero funcionando 🚗',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      parqueaderos: '/api/parqueaderos',
      entradas: '/api/entradas',
      salidas: '/api/salidas',
      reportes: '/api/reportes'
    }
  });
});

// Rutas de autenticación (públicas)
app.post('/api/auth/login', authController.login.bind(authController));
app.post('/api/auth/register', authController.register.bind(authController));

// Rutas protegidas
app.get('/api/auth/profile', authMiddleware, authController.profile.bind(authController));

// Rutas de parqueaderos
app.post('/api/parqueaderos', authMiddleware, adminMiddleware, parqueaderoController.crear.bind(parqueaderoController));
app.get('/api/parqueaderos', authMiddleware, parqueaderoController.obtenerTodos.bind(parqueaderoController));
app.get('/api/parqueaderos/:id', authMiddleware, parqueaderoController.obtenerPorId.bind(parqueaderoController));
app.put('/api/parqueaderos/:id', authMiddleware, adminMiddleware, parqueaderoController.actualizar.bind(parqueaderoController));
app.delete('/api/parqueaderos/:id', authMiddleware, adminMiddleware, parqueaderoController.eliminar.bind(parqueaderoController));
app.get('/api/parqueaderos/alertas/capacidad-baja', authMiddleware, parqueaderoController.verificarCapacidadBaja.bind(parqueaderoController));

// Rutas de entradas
app.post('/api/entradas', authMiddleware, entradaController.registrar.bind(entradaController));
app.get('/api/entradas', authMiddleware, entradaController.obtenerTodas.bind(entradaController));
app.get('/api/entradas/:id', authMiddleware, entradaController.obtenerPorId.bind(entradaController));
app.get('/api/entradas/parqueadero/:parqueaderoId/activas', authMiddleware, entradaController.obtenerActivas.bind(entradaController));

// Rutas de salidas
app.post('/api/salidas', authMiddleware, salidaController.registrar.bind(salidaController));
app.get('/api/salidas', authMiddleware, salidaController.obtenerTodas.bind(salidaController));
app.get('/api/salidas/:id', authMiddleware, salidaController.obtenerPorId.bind(salidaController));

// Rutas de reportes
app.get('/api/reportes/fecha', authMiddleware, reporteController.generarPorFecha.bind(reporteController));
app.get('/api/reportes/tipo-vehiculo', authMiddleware, reporteController.generarPorTipoVehiculo.bind(reporteController));
app.get('/api/reportes/controlador', authMiddleware, reporteController.generarPorControlador.bind(reporteController));

// Manejo de errores
app.use(errorHandler);
app.use(notFoundHandler);

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📊 Modelos sincronizados con la base de datos.');
    }
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// Iniciar servidor
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌐 API disponible en: http://localhost:${PORT}`);
      console.log(`📖 Documentación: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo graceful de cierre del servidor
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  try {
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error);
    process.exit(1);
  }
});

startServer();