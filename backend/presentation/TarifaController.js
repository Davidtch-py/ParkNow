import { TarifaRepository } from '../persistence/TarifaRepository.js';

const tarifaRepository = new TarifaRepository();

export class TarifaController {
  async obtenerTodas(req, res) {
    try {
      const tarifas = await tarifaRepository.findAll();
      res.json({
        success: true,
        tarifas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const tarifa = await tarifaRepository.findById(id);

      if (!tarifa) {
        return res.status(404).json({
          success: false,
          error: 'Tarifa no encontrada'
        });
      }

      res.json({
        success: true,
        tarifa
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async crear(req, res) {
    try {
      // Nuevo payload esperado desde frontend:
      // { parqueaderoId, tipoVehiculo, tipoTarifa, valor, tiempoMinimo, descripcion, activa }
      const {
        parqueaderoId,
        tipoVehiculo,
        tipoTarifa,
        valor,
        tiempoMinimo,
        descripcion,
        activa
      } = req.body;

      // Validaciones básicas
      if (!parqueaderoId) {
        return res.status(400).json({ success: false, error: 'parqueaderoId es requerido' });
      }

      const tiposVehiculo = ['carro', 'moto', 'bicicleta'];
      if (!tipoVehiculo || !tiposVehiculo.includes(tipoVehiculo)) {
        return res.status(400).json({ success: false, error: 'tipoVehiculo inválido. Valores permitidos: carro, moto, bicicleta' });
      }

      const tiposTarifa = ['por_hora', 'tarifa_plana', 'fraccionada'];
      if (!tipoTarifa || !tiposTarifa.includes(tipoTarifa)) {
        return res.status(400).json({ success: false, error: 'tipoTarifa inválido. Valores permitidos: por_hora, tarifa_plana, fraccionada' });
      }

      const valorNum = Number(valor);
      if (isNaN(valorNum) || valorNum < 0) {
        return res.status(400).json({ success: false, error: 'valor debe ser un número >= 0' });
      }

      const tiempoMin = tiempoMinimo !== undefined && tiempoMinimo !== null ? Number(tiempoMinimo) : null;
      if (tiempoMin !== null && (isNaN(tiempoMin) || tiempoMin <= 0)) {
        return res.status(400).json({ success: false, error: 'tiempoMinimo debe ser un número positivo si se envía' });
      }

      // Mapear a los campos del modelo Tarifa
      // modelo espera: parqueaderoId, tipoVehiculo, tarifaHora, tarifaDia, tarifaMes, vigenciaDesde, vigenciaHasta
      const tarifaHora = tipoTarifa === 'por_hora' ? valorNum : 0;
      const tarifaDia = tipoTarifa === 'tarifa_plana' ? valorNum : 0;
      const tarifaMes = tipoTarifa === 'fraccionada' ? valorNum : 0;

      const ahora = new Date();
      const hasta = new Date('2099-12-31T23:59:59Z');

      const nuevaTarifa = await tarifaRepository.create({
        parqueaderoId,
        tipoVehiculo,
        tarifaHora,
        tarifaDia,
        tarifaMes,
        vigenciaDesde: ahora,
        vigenciaHasta: hasta
      });

      return res.status(201).json({ success: true, tarifa: nuevaTarifa });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        parqueaderoId,
        tipoVehiculo,
        tipoTarifa,
        valor,
        tiempoMinimo,
        descripcion,
        activa
      } = req.body;

      const tarifa = await tarifaRepository.findById(id);
      if (!tarifa) {
        return res.status(404).json({
          success: false,
          error: 'Tarifa no encontrada'
        });
      }

      // Construir objeto de actualización sólo con los campos que se envían
      const updateData = {};
      // Mapear campos al modelo existente
      if (parqueaderoId !== undefined) updateData.parqueaderoId = parqueaderoId;
      if (tipoVehiculo !== undefined) updateData.tipoVehiculo = tipoVehiculo;
      if (tipoTarifa !== undefined && valor !== undefined) {
        const v = Number(valor);
        if (tipoTarifa === 'por_hora') {
          updateData.tarifaHora = v;
        } else if (tipoTarifa === 'tarifa_plana') {
          updateData.tarifaDia = v;
        } else if (tipoTarifa === 'fraccionada') {
          updateData.tarifaMes = v;
        }
      } else if (valor !== undefined) {
        // Si cambian sólo el valor y no el tipo, intentar actualizar tarifaHora (por compatibilidad)
        updateData.tarifaHora = Number(valor);
      }

      const tarifaActualizada = await tarifaRepository.update(id, updateData);

      res.json({
        success: true,
        tarifa: tarifaActualizada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const tarifa = await tarifaRepository.findById(id);
      if (!tarifa) {
        return res.status(404).json({
          success: false,
          error: 'Tarifa no encontrada'
        });
      }

      await tarifaRepository.delete(id);

      res.json({
        success: true,
        message: 'Tarifa eliminada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}
