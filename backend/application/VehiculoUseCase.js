import { VehiculoRepository } from '../persistence/VehiculoRepository.js';

export class VehiculoUseCase {
  constructor(vehiculoRepository) {
    this.vehiculoRepository = vehiculoRepository;
  }

  async crearVehiculo(vehiculoData) {
    try {
      // Validaciones
      if (!vehiculoData.placa || !vehiculoData.tipo || !vehiculoData.color) {
        throw new Error('Placa, tipo y color son requeridos');
      }

      // Validar formato de placa (básico)
      const placaRegex = /^[A-Z]{3}[0-9]{3}$/;
      if (!placaRegex.test(vehiculoData.placa.toUpperCase())) {
        throw new Error('Formato de placa inválido. Debe ser 3 letras seguidas de 3 números (Ej: ABC123)');
      }

      // Validar tipo de vehículo
      const tiposValidos = ['carro', 'moto', 'bicicleta'];
      if (!tiposValidos.includes(vehiculoData.tipo.toLowerCase())) {
        throw new Error('Tipo de vehículo inválido. Debe ser: carro, moto o bicicleta');
      }

      // Crear vehículo
      const vehiculo = await this.vehiculoRepository.create({
        ...vehiculoData,
        placa: vehiculoData.placa.toUpperCase()
      });

      return {
        success: true,
        vehiculo
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async obtenerTodos(filters = {}) {
    try {
      const vehiculos = await this.vehiculoRepository.findAll(filters);
      return {
        success: true,
        vehiculos
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async obtenerPorId(id) {
    try {
      const vehiculo = await this.vehiculoRepository.findById(id);
      if (!vehiculo) {
        return {
          success: false,
          error: 'Vehículo no encontrado'
        };
      }

      return {
        success: true,
        vehiculo
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async obtenerPorPlaca(placa) {
    try {
      const vehiculo = await this.vehiculoRepository.findByPlaca(placa.toUpperCase());
      if (!vehiculo) {
        return {
          success: false,
          error: 'Vehículo no encontrado'
        };
      }

      return {
        success: true,
        vehiculo
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async actualizarVehiculo(id, updateData) {
    try {
      // Validaciones
      if (updateData.placa) {
        const placaRegex = /^[A-Z]{3}[0-9]{3}$/;
        if (!placaRegex.test(updateData.placa.toUpperCase())) {
          throw new Error('Formato de placa inválido. Debe ser 3 letras seguidas de 3 números (Ej: ABC123)');
        }
        updateData.placa = updateData.placa.toUpperCase();
      }

      if (updateData.tipo) {
        const tiposValidos = ['carro', 'moto', 'bicicleta'];
        if (!tiposValidos.includes(updateData.tipo.toLowerCase())) {
          throw new Error('Tipo de vehículo inválido. Debe ser: carro, moto o bicicleta');
        }
      }

      const vehiculo = await this.vehiculoRepository.update(id, updateData);
      if (!vehiculo) {
        return {
          success: false,
          error: 'Vehículo no encontrado'
        };
      }

      return {
        success: true,
        vehiculo
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async eliminarVehiculo(id) {
    try {
      const resultado = await this.vehiculoRepository.delete(id);
      return {
        success: true,
        message: resultado.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async obtenerPorTipo(tipo) {
    try {
      const tiposValidos = ['carro', 'moto', 'bicicleta'];
      if (!tiposValidos.includes(tipo.toLowerCase())) {
        throw new Error('Tipo de vehículo inválido. Debe ser: carro, moto o bicicleta');
      }

      const vehiculos = await this.vehiculoRepository.findByTipo(tipo.toLowerCase());
      return {
        success: true,
        vehiculos
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
