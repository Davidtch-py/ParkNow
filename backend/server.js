import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize, Usuario, Parqueadero, Vehiculo, Tarifa, Horario, Registro } from './persistence/models.js';
import { authMiddleware, adminMiddleware } from './infrastructure/authMiddleware.js';
import { errorHandler, notFoundHandler } from './infrastructure/errorHandler.js';
import { mqttService } from './infrastructure/mqttService.js';

// Importar controladores
import { AuthController } from './presentation/AuthController.js';
import { ParqueaderoController } from './presentation/ParqueaderoController.js';
import { EntradaController } from './presentation/EntradaController.js';
import { SalidaController } from './presentation/SalidaController.js';
import { ReporteController } from './presentation/ReporteController.js';
import { TarifaController } from './presentation/TarifaController.js';
import { UsuarioController } from './presentation/UsuarioController.js';
import { HorarioController } from './presentation/HorarioController.js';
import { ParqueaderoUsuarioController } from './presentation/ParqueaderoUsuarioController.js';
import { FestivoController } from './presentation/FestivoController.js';
import { NotificacionController } from './presentation/NotificacionController.js';
import { VehiculoController } from './presentation/VehiculoController.js';
import { TarifaCalculoController } from './presentation/TarifaCalculoController.js';

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
// Configuración de CORS para permitir frontend en Vercel y desarrollo local
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://parknow.vercel.app',
  'https://parknow-git-develop.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean); // Filtrar valores undefined

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman, Thunder Client, etc.)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En producción, verificar lista de orígenes permitidos
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloqueado para origen:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas de prueba
import testRoutes from './testRoutes.js';
app.use('/api/test', testRoutes);

// Ruta de prueba directa para verificar datos
app.get('/api/test/db', async (req, res) => {
  try {
    const result = await sequelize.query('SELECT * FROM parqueaderos LIMIT 5', {
      type: sequelize.QueryTypes.SELECT
    });
    res.json({
      success: true,
      message: 'Consulta directa a la base de datos',
      data: result
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Instanciar controladores
const authController = new AuthController();
const parqueaderoController = new ParqueaderoController();
const entradaController = new EntradaController();
const salidaController = new SalidaController();
const reporteController = new ReporteController();
const tarifaController = new TarifaController();
const usuarioController = new UsuarioController();
const horarioController = new HorarioController();
const parqueaderoUsuarioController = new ParqueaderoUsuarioController();
const festivoController = new FestivoController();
const notificacionController = new NotificacionController();
const vehiculoController = new VehiculoController();
const tarifaCalculoController = new TarifaCalculoController(mqttService);

// Health check endpoint para Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Parqueadero funcionando 🚗',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      parqueaderos: '/api/parqueaderos',
      vehiculos: '/api/vehiculos',
      entradas: '/api/entradas',
      salidas: '/api/salidas',
      reportes: '/api/reportes',
      tarifas: '/api/tarifas',
      usuarios: '/api/usuarios',
      horarios: '/api/horarios',
      asignaciones: '/api/parqueaderos-usuarios',
      festivos: '/api/festivos',
      notificaciones: '/api/notificaciones'
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

// Rutas de vehículos
app.post('/api/vehiculos', authMiddleware, vehiculoController.crear.bind(vehiculoController));
app.get('/api/vehiculos', authMiddleware, vehiculoController.obtenerTodos.bind(vehiculoController));
app.get('/api/vehiculos/:id', authMiddleware, vehiculoController.obtenerPorId.bind(vehiculoController));
app.get('/api/vehiculos/placa/:placa', authMiddleware, vehiculoController.obtenerPorPlaca.bind(vehiculoController));
app.get('/api/vehiculos/tipo/:tipo', authMiddleware, vehiculoController.obtenerPorTipo.bind(vehiculoController));
app.put('/api/vehiculos/:id', authMiddleware, adminMiddleware, vehiculoController.actualizar.bind(vehiculoController));
app.delete('/api/vehiculos/:id', authMiddleware, adminMiddleware, vehiculoController.eliminar.bind(vehiculoController));

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

// Rutas de tarifas
app.get('/api/tarifas', authMiddleware, tarifaController.obtenerTodas.bind(tarifaController));
app.get('/api/tarifas/:id', authMiddleware, tarifaController.obtenerPorId.bind(tarifaController));
app.post('/api/tarifas', authMiddleware, adminMiddleware, tarifaController.crear.bind(tarifaController));
app.put('/api/tarifas/:id', authMiddleware, adminMiddleware, tarifaController.actualizar.bind(tarifaController));
app.delete('/api/tarifas/:id', authMiddleware, adminMiddleware, tarifaController.eliminar.bind(tarifaController));

// Rutas de cálculo de tarifas
app.post('/api/tarifas/calcular-costo', authMiddleware, tarifaCalculoController.calcularCosto.bind(tarifaCalculoController));
app.get('/api/tarifas/parqueadero/:parqueaderoId', authMiddleware, tarifaCalculoController.obtenerTarifasParqueadero.bind(tarifaCalculoController));

// Rutas de usuarios (administración)
app.get('/api/usuarios', authMiddleware, adminMiddleware, usuarioController.obtenerTodos.bind(usuarioController));
app.get('/api/usuarios/:id', authMiddleware, adminMiddleware, usuarioController.obtenerPorId.bind(usuarioController));
app.post('/api/usuarios', authMiddleware, adminMiddleware, usuarioController.crear.bind(usuarioController));
app.put('/api/usuarios/:id', authMiddleware, adminMiddleware, usuarioController.actualizar.bind(usuarioController));
app.delete('/api/usuarios/:id', authMiddleware, adminMiddleware, usuarioController.eliminar.bind(usuarioController));


// Rutas de horarios
app.get('/api/horarios', authMiddleware, horarioController.obtenerTodos.bind(horarioController));
app.get('/api/horarios/:id', authMiddleware, horarioController.obtenerPorId.bind(horarioController));
app.get('/api/horarios/parqueadero/:parqueaderoId', authMiddleware, horarioController.obtenerPorParqueadero.bind(horarioController));
app.post('/api/horarios', authMiddleware, adminMiddleware, horarioController.crear.bind(horarioController));
app.put('/api/horarios/:id', authMiddleware, adminMiddleware, horarioController.actualizar.bind(horarioController));
app.delete('/api/horarios/:id', authMiddleware, adminMiddleware, horarioController.eliminar.bind(horarioController));

// Rutas de asignación de parqueaderos a controladores
app.post('/api/parqueaderos-usuarios/asignar', authMiddleware, adminMiddleware, parqueaderoUsuarioController.asignar.bind(parqueaderoUsuarioController));
app.post('/api/parqueaderos-usuarios/desasignar', authMiddleware, adminMiddleware, parqueaderoUsuarioController.desasignar.bind(parqueaderoUsuarioController));
app.get('/api/parqueaderos-usuarios/controlador/:idUsuario?', authMiddleware, parqueaderoUsuarioController.obtenerParqueaderosPorControlador.bind(parqueaderoUsuarioController));
app.get('/api/parqueaderos-usuarios/parqueadero/:idParqueadero', authMiddleware, parqueaderoUsuarioController.obtenerControladoresPorParqueadero.bind(parqueaderoUsuarioController));
app.get('/api/parqueaderos-usuarios/controladores', authMiddleware, adminMiddleware, parqueaderoUsuarioController.obtenerTodosLosControladores.bind(parqueaderoUsuarioController));

// Rutas de festivos
app.get('/api/festivos', authMiddleware, festivoController.obtenerTodos.bind(festivoController));
app.get('/api/festivos/verificar', authMiddleware, festivoController.verificarFestivo.bind(festivoController));
app.post('/api/festivos/sincronizar/auto', authMiddleware, adminMiddleware, festivoController.sincronizarActualYSiguiente.bind(festivoController));
app.post('/api/festivos/sincronizar/:year', authMiddleware, adminMiddleware, festivoController.sincronizar.bind(festivoController));
app.get('/api/festivos/:id', authMiddleware, festivoController.obtenerPorId.bind(festivoController));
app.post('/api/festivos', authMiddleware, adminMiddleware, festivoController.crear.bind(festivoController));
app.put('/api/festivos/:id', authMiddleware, adminMiddleware, festivoController.actualizar.bind(festivoController));
app.delete('/api/festivos/:id', authMiddleware, adminMiddleware, festivoController.eliminar.bind(festivoController));

// Rutas de notificaciones MQTT
app.get('/api/notificaciones/config', authMiddleware, notificacionController.obtenerConfiguracion.bind(notificacionController));
app.get('/api/notificaciones/stats', authMiddleware, adminMiddleware, notificacionController.obtenerEstadisticas.bind(notificacionController));
app.post('/api/notificaciones/prueba', authMiddleware, adminMiddleware, notificacionController.enviarPrueba.bind(notificacionController));

// Manejo de errores
app.use(errorHandler);
app.use(notFoundHandler);

// Función para insertar datos de prueba
async function insertSeedData() {
  try {
    // Insertar usuarios
    const usuarios = await Usuario.bulkCreate([
      {
        nombre: 'Admin Principal',
        email: 'admin@parqueadero.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        rol: 'admin'
      },
      {
        nombre: 'Juan Pérez',
        email: 'juan.perez@parqueadero.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        rol: 'controlador'
      },
      {
        nombre: 'María García',
        email: 'maria.garcia@parqueadero.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        rol: 'controlador'
      }
    ]);

    // Insertar parqueaderos
    const parqueaderos = await Parqueadero.bulkCreate([
      {
        nombre: 'Parqueadero Centro',
        direccion: 'Calle 50 #10-20, Centro',
        capacidadTotal: 100,
        capacidadDisponible: 85,
        latitud: 4.6097100,
        longitud: -74.0817500
      },
      {
        nombre: 'Parqueadero Norte',
        direccion: 'Carrera 15 #80-45, Zona Rosa',
        capacidadTotal: 150,
        capacidadDisponible: 120,
        latitud: 4.6629700,
        longitud: -74.0583600
      },
      {
        nombre: 'Parqueadero Sur',
        direccion: 'Avenida Primera #30-15, Sur',
        capacidadTotal: 80,
        capacidadDisponible: 65,
        latitud: 4.5481200,
        longitud: -74.1141300
      },
      {
        nombre: 'Parqueadero Chapinero',
        direccion: 'Calle 63 #11-50, Chapinero',
        capacidadTotal: 200,
        capacidadDisponible: 180,
        latitud: 4.6533200,
        longitud: -74.0630100
      }
    ]);

    // Insertar vehículos
    const vehiculos = await Vehiculo.bulkCreate([
      {
        placa: 'ABC123',
        tipo: 'carro',
        color: 'Blanco',
        marca: 'Toyota',
        modelo: 'Corolla',
        propietario: 'Pedro Martínez',
        telefono: '3001234567'
      },
      {
        placa: 'DEF456',
        tipo: 'carro',
        color: 'Negro',
        marca: 'Chevrolet',
        modelo: 'Aveo',
        propietario: 'Ana López',
        telefono: '3009876543'
      },
      {
        placa: 'GHI789',
        tipo: 'moto',
        color: 'Rojo',
        marca: 'Yamaha',
        modelo: 'FZ150',
        propietario: 'Luis Sánchez',
        telefono: '3005551234'
      }
    ]);

    // Insertar algunas entradas activas
    await Entrada.bulkCreate([
      {
        vehiculoId: vehiculos[0].id,
        parqueaderoId: parqueaderos[0].id,
        controladorId: usuarios[1].id,
        fechaHoraEntrada: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        espacioAsignado: 15
      },
      {
        vehiculoId: vehiculos[1].id,
        parqueaderoId: parqueaderos[0].id,
        controladorId: usuarios[1].id,
        fechaHoraEntrada: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
        espacioAsignado: 16
      },
      {
        vehiculoId: vehiculos[2].id,
        parqueaderoId: parqueaderos[1].id,
        controladorId: usuarios[2].id,
        fechaHoraEntrada: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        espacioAsignado: 5
      }
    ]);

    console.log('✅ Datos de prueba insertados correctamente');
  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
  }
}

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos (recrear tablas para resolver problemas de enum)
    await sequelize.sync({ force: true });
    console.log('📊 Tablas sincronizadas correctamente.');
    
    // Verificar si hay datos, si no, insertar datos de prueba
    const userCount = await sequelize.models.Usuario.count();
    if (userCount === 0) {
      console.log('� Insertando datos de prueba...');
      await insertSeedData();
    } else {
      console.log('📋 Base de datos ya contiene datos.');
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
    
    // Inicializar broker MQTT
    const mqttPort = process.env.MQTT_PORT || 1883;
    const mqttWsPort = process.env.MQTT_WS_PORT || 8883;
    mqttService.initialize(mqttPort, mqttWsPort);
    
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
    await mqttService.close();
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error);
    process.exit(1);
  }
});

startServer();