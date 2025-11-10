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
  timestamps: true
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
    validate: {
      min: 1
    }
  },
  capacidadDisponible: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  timestamps: true
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
    type: DataTypes.ENUM('carro', 'moto', 'bicicleta'),
    allowNull: false
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
  timestamps: true
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
    type: DataTypes.ENUM('carro', 'moto', 'bicicleta'),
    allowNull: false
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
  timestamps: true
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
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 6
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
  }
}, {
  tableName: 'horarios',
  timestamps: true
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
  timestamps: true
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
  timestamps: true
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

export {
  sequelize,
  Usuario,
  Parqueadero,
  Vehiculo,
  Tarifa,
  Horario,
  Entrada,
  Salida
};