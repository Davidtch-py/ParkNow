import { DataTypes } from 'sequelize';
import sequelize from './database.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('ADMIN', 'CONTROLADOR'),
    allowNull: false,
    defaultValue: 'CONTROLADOR'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  underscored: true
});

const Parqueadero = sequelize.define('Parqueadero', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  capacidadTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'capacidad_total',
    validate: {
      min: 1
    }
  },
  capacidadDisponible: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'capacidad_disponible',
    validate: {
      min: 0
    }
  },
  latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  }
}, {
  tableName: 'parqueaderos',
  timestamps: true,
  underscored: true
});

const Vehiculo = sequelize.define('Vehiculo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  placa: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  tipo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'tipo', // Mapear a la columna 'tipo' en la BD (para compatibilidad con aplicación)
    validate: {
      isIn: [['carro', 'moto', 'bicicleta']]
    }
  },
  color: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  modelo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  propietario: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: true
  }
}, {
  tableName: 'vehiculos',
  timestamps: true,
  underscored: true
});

const Tarifa = sequelize.define('Tarifa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parqueaderoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Parqueadero,
      key: 'id'
    }
  },
  tipoVehiculo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['carro', 'moto', 'bicicleta']]
    }
  },
  tarifaHora: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tarifaDia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tarifaMes: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  vigenciaDesde: {
    type: DataTypes.DATE,
    allowNull: false
  },
  vigenciaHasta: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'tarifas',
  timestamps: true,
  underscored: true
});

const Horario = sequelize.define('Horario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parqueaderoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Parqueadero,
      key: 'id'
    }
  },
  diaSemana: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO', 'FESTIVO']]
    }
  },
  horaApertura: {
    type: DataTypes.TIME,
    allowNull: false
  },
  horaCierre: {
    type: DataTypes.TIME,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  esFestivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'horarios',
  timestamps: true,
  underscored: true
});

const Registro = sequelize.define('Registro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_vehiculo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vehiculo,
      key: 'id'
    }
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  id_espacio: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'espacios',
      key: 'id'
    }
  },
  fecha_ingreso: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_salida: {
    type: DataTypes.DATE,
    allowNull: true
  },
  monto_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'registros',
  timestamps: true,
  underscored: true
});

// Añadir método de dominio a Parqueadero
Parqueadero.prototype.puedeRecibirVehiculo = function() {
  return (this.capacidadDisponible || 0) > 0;
};

// Definir asociaciones
Parqueadero.hasMany(Tarifa, { foreignKey: 'parqueaderoId' });
Tarifa.belongsTo(Parqueadero, { foreignKey: 'parqueaderoId' });

Parqueadero.hasMany(Horario, { foreignKey: 'parqueaderoId' });
Horario.belongsTo(Parqueadero, { foreignKey: 'parqueaderoId' });

// Registro se relaciona con Vehiculo y Usuario
Vehiculo.hasMany(Registro, { foreignKey: 'id_vehiculo', as: 'registros' });
Registro.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo' });

Usuario.hasMany(Registro, { foreignKey: 'id_usuario', as: 'registros' });
Registro.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'controlador' });

// Definición del modelo Espacio
const Espacio = sequelize.define('Espacio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_parqueadero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_parqueadero',
    references: {
      model: Parqueadero,
      key: 'id'
    }
  },
  codigo_espacio: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'codigo_espacio'
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'LIBRE',
    validate: {
      isIn: [['LIBRE', 'OCUPADO', 'RESERVADO', 'FUERA_SERVICIO']]
    }
  }
}, {
  tableName: 'espacios',
  timestamps: true,
  underscored: true
});

// Modelo de Reporte
const Reporte = sequelize.define('Reporte', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('diario', 'semanal', 'mensual', 'personalizado'),
    allowNull: false,
    defaultValue: 'personalizado'
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fechaInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_inicio'
  },
  fechaFin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_fin'
  },
  parqueaderoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parqueadero_id',
    references: {
      model: Parqueadero,
      key: 'id'
    }
  },
  parqueaderoNombre: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'parqueadero_nombre'
  },
  controlador: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  totalVehiculos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_vehiculos'
  },
  totalIngresos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_ingresos'
  },
  tiempoPromedioEstadia: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'tiempo_promedio_estadia'
  },
  vehiculosPorTipo: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: { carros: 0, motos: 0, bicicletas: 0 },
    field: 'vehiculos_por_tipo'
  },
  fechaGeneracion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_generacion'
  },
  estado: {
    type: DataTypes.ENUM('generado', 'enviado', 'descargado'),
    allowNull: false,
    defaultValue: 'generado'
  }
}, {
  tableName: 'reportes',
  timestamps: true,
  underscored: true
});

// Agregar asociaciones para Espacio
Parqueadero.hasMany(Espacio, { foreignKey: 'id_parqueadero', as: 'espacios' });
Espacio.belongsTo(Parqueadero, { foreignKey: 'id_parqueadero', as: 'parqueadero' });

// Registro se relaciona con Espacio
Espacio.hasMany(Registro, { foreignKey: 'id_espacio', as: 'registros' });
Registro.belongsTo(Espacio, { foreignKey: 'id_espacio', as: 'espacio' });

// Reporte se relaciona con Parqueadero
Parqueadero.hasMany(Reporte, { foreignKey: 'parqueadero_id', as: 'reportes' });
Reporte.belongsTo(Parqueadero, { foreignKey: 'parqueadero_id', as: 'parqueadero' });

export {
  sequelize,
  Usuario,
  Parqueadero,
  Vehiculo,
  Tarifa,
  Horario,
  Espacio,
  Registro,
  Reporte
};