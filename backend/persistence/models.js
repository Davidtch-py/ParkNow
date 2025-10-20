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
    type: DataTypes.ENUM('admin', 'controlador'),
    allowNull: false,
    defaultValue: 'controlador'
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
    validate: {
      isIn: [['carro', 'moto', 'bicicleta']]
    }
  },
  color: {
    type: DataTypes.STRING(30),
    allowNull: true
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
    allowNull: false
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

const Entrada = sequelize.define('Entrada', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehiculoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vehiculo,
      key: 'id'
    }
  },
  parqueaderoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Parqueadero,
      key: 'id'
    }
  },
  controladorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  fechaHoraEntrada: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  espacioAsignado: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'entradas',
  timestamps: true,
  underscored: true
});

const Salida = sequelize.define('Salida', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entradaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: Entrada,
      key: 'id'
    }
  },
  fechaHoraSalida: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tiempoTotal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  montoTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  controladorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id'
    }
  }
}, {
  tableName: 'salidas',
  timestamps: true,
  underscored: true
});

// Definir asociaciones
Parqueadero.hasMany(Tarifa, { foreignKey: 'parqueaderoId' });
Tarifa.belongsTo(Parqueadero, { foreignKey: 'parqueaderoId' });

Parqueadero.hasMany(Horario, { foreignKey: 'parqueaderoId' });
Horario.belongsTo(Parqueadero, { foreignKey: 'parqueaderoId' });

Parqueadero.hasMany(Entrada, { foreignKey: 'parqueaderoId' });
Entrada.belongsTo(Parqueadero, { foreignKey: 'parqueaderoId' });

Vehiculo.hasMany(Entrada, { foreignKey: 'vehiculoId' });
Entrada.belongsTo(Vehiculo, { foreignKey: 'vehiculoId' });

Usuario.hasMany(Entrada, { foreignKey: 'controladorId' });
Entrada.belongsTo(Usuario, { foreignKey: 'controladorId', as: 'controlador' });

Usuario.hasMany(Salida, { foreignKey: 'controladorId' });
Salida.belongsTo(Usuario, { foreignKey: 'controladorId', as: 'controlador' });

Entrada.hasOne(Salida, { foreignKey: 'entradaId' });
Salida.belongsTo(Entrada, { foreignKey: 'entradaId' });

// Definición del modelo Espacio
const Espacio = sequelize.define('Espacio', {
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
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipoVehiculo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['carro', 'moto', 'bicicleta']]
    }
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'DISPONIBLE',
    validate: {
      isIn: [['DISPONIBLE', 'OCUPADO', 'MANTENIMIENTO']]
    }
  },
  vehiculoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Vehiculo,
      key: 'id'
    }
  }
}, {
  tableName: 'espacios',
  timestamps: true,
  underscored: true
});

// Agregar asociaciones para Espacio
Parqueadero.hasMany(Espacio, { foreignKey: 'parqueaderoId', as: 'espacios' });
Espacio.belongsTo(Parqueadero, { foreignKey: 'parqueaderoId', as: 'parqueadero' });
Vehiculo.hasMany(Espacio, { foreignKey: 'vehiculoId', as: 'espaciosOcupados' });
Espacio.belongsTo(Vehiculo, { foreignKey: 'vehiculoId', as: 'vehiculo' });

export {
  sequelize,
  Usuario,
  Parqueadero,
  Vehiculo,
  Tarifa,
  Horario,
  Entrada,
  Salida,
  Espacio
};