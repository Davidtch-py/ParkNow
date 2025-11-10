import Aedes from 'aedes';
import { createServer } from 'net';
import { WebSocketServer } from 'ws';
import { createServer as createHttpServer } from 'http';
import { Duplex } from 'stream';

class MQTTService {
  constructor() {
    this.aedes = null;
    this.mqttServer = null;
    this.wsServer = null;
    this.httpServer = null;
    this.clients = new Map();
  }

  /**
   * Inicializar el broker MQTT
   */
  initialize(mqttPort = 1883, wsPort = 8883) {
    try {
      // Crear instancia de Aedes (broker MQTT)
      this.aedes = new Aedes();

      // Servidor MQTT sobre TCP
      this.mqttServer = createServer(this.aedes.handle);
      this.mqttServer.listen(mqttPort, () => {
        console.log(`🔌 Broker MQTT iniciado en puerto ${mqttPort}`);
      });

      // Servidor MQTT sobre WebSocket para clientes web
      this.httpServer = createHttpServer();
      this.wsServer = new WebSocketServer({ server: this.httpServer });

      this.wsServer.on('connection', (ws) => {
        // Crear un stream duplex compatible con Aedes
        const stream = new Duplex({
          read() {},
          write(chunk, encoding, callback) {
            if (ws.readyState === 1) { // OPEN
              ws.send(chunk, callback);
            } else {
              callback();
            }
          }
        });

        // Conectar WebSocket con el stream
        ws.on('message', (data) => {
          stream.push(data);
        });

        ws.on('close', () => {
          stream.push(null);
          stream.end();
        });

        ws.on('error', (err) => {
          stream.destroy(err);
        });

        stream.on('data', (data) => {
          if (ws.readyState === 1) {
            ws.send(data);
          }
        });
        
        this.aedes.handle(stream);
      });

      this.httpServer.listen(wsPort, () => {
        console.log(`🌐 Broker MQTT WebSocket iniciado en puerto ${wsPort}`);
      });

      // Event listeners
      this.setupEventListeners();

      return true;
    } catch (error) {
      console.error('❌ Error al inicializar MQTT:', error);
      return false;
    }
  }

  /**
   * Configurar listeners de eventos del broker
   */
  setupEventListeners() {
    this.aedes.on('client', (client) => {
      console.log(`✅ Cliente MQTT conectado: ${client.id}`);
      this.clients.set(client.id, client);
    });

    this.aedes.on('clientDisconnect', (client) => {
      console.log(`❌ Cliente MQTT desconectado: ${client.id}`);
      this.clients.delete(client.id);
    });

    this.aedes.on('subscribe', (subscriptions, client) => {
      console.log(`📬 Cliente ${client.id} suscrito a:`, subscriptions.map(s => s.topic).join(', '));
    });

    this.aedes.on('publish', (packet, client) => {
      if (client) {
        console.log(`📤 Mensaje publicado por ${client.id} en ${packet.topic}`);
      }
    });
  }

  /**
   * Publicar una notificación
   */
  publish(topic, message) {
    if (!this.aedes) {
      console.error('❌ Broker MQTT no inicializado');
      return false;
    }

    try {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      
      this.aedes.publish({
        topic,
        payload: Buffer.from(payload),
        qos: 1,
        retain: false
      }, (error) => {
        if (error) {
          console.error(`❌ Error al publicar en ${topic}:`, error);
        } else {
          console.log(`✅ Mensaje publicado en ${topic}`);
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Error al publicar mensaje:', error);
      return false;
    }
  }

  /**
   * Publicar notificación de capacidad baja
   */
  notificarCapacidadBaja(parqueadero) {
    const notification = {
      type: 'CAPACIDAD_BAJA',
      timestamp: new Date().toISOString(),
      parqueadero: {
        id: parqueadero.id,
        nombre: parqueadero.nombre,
        capacidadDisponible: parqueadero.capacidad_disponible || parqueadero.capacidadDisponible,
        capacidadTotal: parqueadero.capacidad_total || parqueadero.capacidadTotal,
        porcentaje: Math.round(((parqueadero.capacidad_disponible || parqueadero.capacidadDisponible) / 
                               (parqueadero.capacidad_total || parqueadero.capacidadTotal)) * 100)
      },
      message: `El parqueadero ${parqueadero.nombre} tiene baja capacidad disponible`
    };

    // Publicar en topic general y específico del parqueadero
    this.publish('parknow/notificaciones/capacidad', notification);
    this.publish(`parknow/parqueadero/${parqueadero.id}/capacidad`, notification);
  }

  /**
   * Notificar entrada de vehículo
   */
  notificarEntrada(entrada) {
    const notification = {
      type: 'ENTRADA_VEHICULO',
      timestamp: new Date().toISOString(),
      entrada: {
        id: entrada.id,
        vehiculo: entrada.vehiculo,
        parqueadero: entrada.parqueadero,
        espacio: entrada.espacio,
        fechaHora: entrada.fecha_ingreso || entrada.fechaHoraEntrada
      },
      message: `Vehículo ${entrada.vehiculo?.placa || 'N/A'} ingresó al parqueadero`
    };

    this.publish('parknow/notificaciones/entradas', notification);
    this.publish(`parknow/parqueadero/${entrada.parqueadero?.id || entrada.id_parqueadero}/entradas`, notification);
  }

  /**
   * Notificar salida de vehículo
   */
  notificarSalida(salida) {
    const notification = {
      type: 'SALIDA_VEHICULO',
      timestamp: new Date().toISOString(),
      salida: {
        id: salida.id,
        vehiculo: salida.vehiculo,
        parqueadero: salida.parqueadero,
        monto: salida.monto_total || salida.montoTotal,
        fechaHora: salida.fecha_salida || salida.fechaHoraSalida
      },
      message: `Vehículo ${salida.vehiculo?.placa || 'N/A'} salió del parqueadero`
    };

    this.publish('parknow/notificaciones/salidas', notification);
    this.publish(`parknow/parqueadero/${salida.parqueadero?.id || salida.id_parqueadero}/salidas`, notification);
  }

  /**
   * Notificar alerta general
   */
  notificarAlerta(tipo, mensaje, datos = {}) {
    const notification = {
      type: tipo,
      timestamp: new Date().toISOString(),
      message: mensaje,
      data: datos
    };

    this.publish('parknow/notificaciones/alertas', notification);
  }

  /**
   * Cerrar el broker MQTT
   */
  close() {
    return new Promise((resolve) => {
      if (this.aedes) {
        this.aedes.close(() => {
          console.log('🛑 Broker MQTT cerrado');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Obtener estadísticas del broker
   */
  getStats() {
    return {
      clientsConnected: this.clients.size,
      clients: Array.from(this.clients.keys())
    };
  }
}

// Exportar instancia singleton
export const mqttService = new MQTTService();
