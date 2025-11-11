import { TarifaRepository } from '../persistence/TarifaRepository.js';
import { SalidaRepository } from '../persistence/SalidaRepository.js';

export class TarifaUseCase {
  constructor(tarifaRepository, salidaRepository) {
    this.tarifaRepository = tarifaRepository;
    this.salidaRepository = salidaRepository;
  }

  /**
   * Calcula el costo de estacionamiento basado en tarifa y tiempo
   * @param {number} parqueaderoId - ID del parqueadero
   * @param {string} tipoVehiculo - Tipo de vehículo (carro, moto, bicicleta)
   * @param {Date} fechaIngreso - Fecha y hora de ingreso
   * @param {Date} fechaSalida - Fecha y hora de salida (por defecto ahora)
   * @returns {Object} Objeto con detalles del cálculo
   */
  async calcularCosto(parqueaderoId, tipoVehiculo, fechaIngreso, fechaSalida = new Date()) {
    try {
      // Obtener tarifa vigente
      const tarifa = await this.tarifaRepository.findByParqueaderoAndTipo(
        parqueaderoId,
        tipoVehiculo
      );

      if (!tarifa) {
        throw new Error(`No hay tarifa vigente para ${tipoVehiculo} en este parqueadero`);
      }

      // Calcular tiempo estacionado
      const tiempoMs = fechaSalida - new Date(fechaIngreso);
      const tiempoMinutos = Math.ceil(tiempoMs / (1000 * 60));
      const tiempoHoras = tiempoMinutos / 60;
      const tiempoDias = tiempoHoras / 24;

      // Determinar tarifa a aplicar
      let costo = 0;
      let tarifaAplicada = 'hora';

      // Si es más de 24 horas, aplicar tarifa de día
      if (tiempoDias >= 1) {
        const diasCompletos = Math.floor(tiempoDias);
        const horasRestantes = (tiempoDias - diasCompletos) * 24;
        
        costo = diasCompletos * parseFloat(tarifa.tarifaDia);
        
        // Agregar costo de horas restantes
        if (horasRestantes > 0) {
          costo += Math.ceil(horasRestantes) * parseFloat(tarifa.tarifaHora);
        }
        
        tarifaAplicada = 'dia';
      } else {
        // Aplicar tarifa por hora (aproximar hacia arriba)
        const horasRedondeadas = Math.ceil(tiempoHoras);
        costo = horasRedondeadas * parseFloat(tarifa.tarifaHora);
        tarifaAplicada = 'hora';
      }

      return {
        success: true,
        costo: parseFloat(costo.toFixed(2)),
        detalles: {
          tiempoMinutos,
          tiempoHoras: parseFloat(tiempoHoras.toFixed(2)),
          tiempoDias: parseFloat(tiempoDias.toFixed(2)),
          tarifaAplicada,
          tarifaHora: parseFloat(tarifa.tarifaHora),
          tarifaDia: parseFloat(tarifa.tarifaDia),
          tarifaMes: parseFloat(tarifa.tarifaMes),
          tipoVehiculo,
          parqueaderoId
        },
        recibo: this.generarRecibo({
          tiempoMinutos,
          tiempoHoras,
          tiempoDias,
          costo,
          tarifaAplicada,
          tarifa,
          fechaIngreso,
          fechaSalida
        })
      };
    } catch (error) {
      throw new Error(`Error calculando costo: ${error.message}`);
    }
  }

  /**
   * Genera un recibo de salida
   */
  generarRecibo(datos) {
    const {
      tiempoMinutos,
      tiempoHoras,
      tiempoDias,
      costo,
      tarifaAplicada,
      tarifa,
      fechaIngreso,
      fechaSalida
    } = datos;

    const horasFormato = Math.floor(tiempoHoras);
    const minutosFormato = tiempoMinutos % 60;

    let detallesTarifa = '';
    if (tarifaAplicada === 'dia') {
      const diasCompletos = Math.floor(tiempoDias);
      const horasRestantes = (tiempoDias - diasCompletos) * 24;
      detallesTarifa = `${diasCompletos} día(s) × $${tarifa.tarifaDia}`;
      if (horasRestantes > 0) {
        detallesTarifa += ` + ${Math.ceil(horasRestantes)} hora(s) × $${tarifa.tarifaHora}`;
      }
    } else {
      detallesTarifa = `${Math.ceil(tiempoHoras)} hora(s) × $${tarifa.tarifaHora}`;
    }

    return {
      fechaIngreso: new Date(fechaIngreso).toLocaleString('es-CO'),
      fechaSalida: new Date(fechaSalida).toLocaleString('es-CO'),
      tiempoEstacionado: `${horasFormato}h ${minutosFormato}m`,
      detallesTarifa,
      costoTotal: `$${costo.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };
  }

  /**
   * Obtiene todas las tarifas de un parqueadero
   */
  async obtenerTarifasParqueadero(parqueaderoId) {
    try {
      const tarifas = await this.tarifaRepository.findByParqueadero(parqueaderoId);
      return {
        success: true,
        tarifas
      };
    } catch (error) {
      throw new Error(`Error obteniendo tarifas: ${error.message}`);
    }
  }

  /**
   * Crea una nueva tarifa
   */
  async crearTarifa(tarifaData) {
    try {
      // Validaciones
      if (!tarifaData.parqueaderoId || !tarifaData.tipoVehiculo) {
        throw new Error('ParqueaderoId y tipoVehiculo son requeridos');
      }

      if (!tarifaData.tarifaHora || !tarifaData.tarifaDia || !tarifaData.tarifaMes) {
        throw new Error('Todas las tarifas (hora, día, mes) son requeridas');
      }

      if (!tarifaData.vigenciaDesde || !tarifaData.vigenciaHasta) {
        throw new Error('Vigencia desde y hasta son requeridas');
      }

      const tarifa = await this.tarifaRepository.create(tarifaData);
      return {
        success: true,
        tarifa
      };
    } catch (error) {
      throw new Error(`Error creando tarifa: ${error.message}`);
    }
  }

  /**
   * Actualiza una tarifa
   */
  async actualizarTarifa(id, tarifaData) {
    try {
      const tarifa = await this.tarifaRepository.update(id, tarifaData);
      return {
        success: true,
        tarifa
      };
    } catch (error) {
      throw new Error(`Error actualizando tarifa: ${error.message}`);
    }
  }

  /**
   * Elimina una tarifa
   */
  async eliminarTarifa(id) {
    try {
      await this.tarifaRepository.delete(id);
      return {
        success: true,
        mensaje: 'Tarifa eliminada correctamente'
      };
    } catch (error) {
      throw new Error(`Error eliminando tarifa: ${error.message}`);
    }
  }
}
