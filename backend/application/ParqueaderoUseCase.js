export class ParqueaderoUseCase {
  constructor(parqueaderoRepository, horarioRepository) {
    this.parqueaderoRepository = parqueaderoRepository;
    this.horarioRepository = horarioRepository;
  }

  async crearParqueadero(parqueaderoData) {
    try {
      const nuevoParqueadero = await this.parqueaderoRepository.create({
        ...parqueaderoData,
        capacidadDisponible: parqueaderoData.capacidadTotal
      });

      return {
        success: true,
        parqueadero: nuevoParqueadero
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async obtenerParqueaderos() {
    try {
      const parqueaderos = await this.parqueaderoRepository.findAll();
      return {
        success: true,
        parqueaderos
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verificarCapacidadBaja(umbral = 10) {
    try {
      const parqueaderos = await this.parqueaderoRepository.findAll();
      const alertas = parqueaderos
        .filter(p => p.isCapacidadBaja(umbral))
        .map(p => ({
          id: p.id,
          nombre: p.nombre,
          capacidadDisponible: p.capacidadDisponible,
          capacidadTotal: p.capacidadTotal,
          porcentajeDisponible: Math.round((p.capacidadDisponible / p.capacidadTotal) * 100)
        }));

      return {
        success: true,
        alertas
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async actualizarParqueadero(id, updateData) {
    try {
      const parqueadero = await this.parqueaderoRepository.findById(id);
      if (!parqueadero) {
        throw new Error('Parqueadero no encontrado');
      }

      const parqueaderoActualizado = await this.parqueaderoRepository.update(id, updateData);
      
      return {
        success: true,
        parqueadero: parqueaderoActualizado
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async eliminarParqueadero(id) {
    try {
      const eliminado = await this.parqueaderoRepository.delete(id);
      if (!eliminado) {
        throw new Error('Parqueadero no encontrado');
      }

      return {
        success: true,
        mensaje: 'Parqueadero eliminado correctamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}