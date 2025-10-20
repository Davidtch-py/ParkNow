import { mqttService } from '../infrastructure/mqttService.js';

export class NotificacionController {
  /**
   * Obtener estadísticas del broker MQTT
   */
  async obtenerEstadisticas(req, res) {
    try {
      const stats = mqttService.getStats();
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Enviar notificación de prueba
   */
  async enviarPrueba(req, res) {
    try {
      const { tipo, mensaje, datos } = req.body;

      if (!tipo || !mensaje) {
        return res.status(400).json({
          success: false,
          error: 'Tipo y mensaje son requeridos'
        });
      }

      mqttService.notificarAlerta(tipo, mensaje, datos || {});

      res.json({
        success: true,
        message: 'Notificación de prueba enviada'
      });
    } catch (error) {
      console.error('[ERROR] Error al enviar notificación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener información de conexión MQTT para clientes
   */
  async obtenerConfiguracion(req, res) {
    try {
      const config = {
        wsUrl: `ws://localhost:8883`,
        topics: {
          capacidad: 'parknow/notificaciones/capacidad',
          entradas: 'parknow/notificaciones/entradas',
          salidas: 'parknow/notificaciones/salidas',
          alertas: 'parknow/notificaciones/alertas',
          parqueaderoEspecifico: 'parknow/parqueadero/{id}/#'
        },
        qos: 1
      };

      res.json({
        success: true,
        config
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}
