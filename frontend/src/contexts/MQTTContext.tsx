import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { toast } from 'react-toastify';

interface MQTTContextType {
  client: MqttClient | null;
  isConnected: boolean;
  subscribe: (topic: string, callback: (message: any) => void) => void;
  unsubscribe: (topic: string) => void;
  publish: (topic: string, message: any) => void;
}

const MQTTContext = createContext<MQTTContextType | undefined>(undefined);

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) {
    throw new Error('useMQTT debe ser usado dentro de MQTTProvider');
  }
  return context;
};

interface MQTTProviderProps {
  children: React.ReactNode;
}

export const MQTTProvider: React.FC<MQTTProviderProps> = ({ children }) => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = React.useRef<Map<string, (message: any) => void>>(new Map());

  // Función para manejar notificaciones globales (fuera del useEffect)
  const handleGlobalNotification = React.useCallback((topic: string, data: any) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Notificaciones de capacidad baja
    if (topic === 'parknow/notificaciones/capacidad' && data.type === 'CAPACIDAD_BAJA') {
      const { parqueadero } = data;
      
      // Mostrar notificación según el rol
      if (user.rol === 'admin') {
        toast.error(
          `🚨 Capacidad Crítica: ${parqueadero.nombre} - ${parqueadero.porcentaje}% disponible`,
          {
            autoClose: false,
            position: 'top-right',
            onClick: () => {
              window.location.href = '/parknow-alertas';
            }
          }
        );
      } else if (user.rol === 'controlador') {
        toast.warning(
          `⚠️ Alerta: ${parqueadero.nombre} tiene baja capacidad (${parqueadero.porcentaje}%)`,
          {
            autoClose: 5000,
            position: 'top-right'
          }
        );
      }
    }

    // Notificaciones de entrada de vehículo
    if (topic.includes('/entradas') && data.type === 'ENTRADA_VEHICULO') {
      if (user.rol === 'admin' || user.rol === 'controlador') {
        toast.info(
          `🚗 Entrada: ${data.entrada.vehiculo?.placa || 'Vehículo'} en ${data.entrada.parqueadero?.nombre || 'parqueadero'}`,
          {
            autoClose: 3000,
            position: 'bottom-right'
          }
        );
      }
    }

    // Notificaciones de salida de vehículo
    if (topic.includes('/salidas') && data.type === 'SALIDA_VEHICULO') {
      if (user.rol === 'admin' || user.rol === 'controlador') {
        toast.info(
          `🚙 Salida: ${data.salida.vehiculo?.placa || 'Vehículo'} - $${data.salida.monto_total || 0}`,
          {
            autoClose: 3000,
            position: 'bottom-right'
          }
        );
      }
    }
  }, []);

  useEffect(() => {
    try {
      console.log('🔌 Conectando a MQTT...');
      
      const mqttClient = mqtt.connect('ws://localhost:8883', {
        reconnectPeriod: 5000,
        connectTimeout: 3000,
        clientId: `parknow_web_${Math.random().toString(16).slice(2, 10)}`,
      });

      mqttClient.on('connect', () => {
        console.log('✅ Conectado a MQTT Broker');
        setIsConnected(true);
        toast.success('Conectado al sistema de notificaciones en tiempo real', {
          autoClose: 2000,
          position: 'bottom-right'
        });
      });

      mqttClient.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('📨 Mensaje MQTT recibido:', { topic, data });

          // Ejecutar callback específico del topic
          const callback = subscriptionsRef.current.get(topic);
          if (callback) {
            callback(data);
          }

          // Manejar notificaciones globales
          handleGlobalNotification(topic, data);
        } catch (error) {
          console.error('Error procesando mensaje MQTT:', error);
        }
      });

      mqttClient.on('error', (error) => {
        console.warn('⚠️ Error MQTT:', error.message);
        setIsConnected(false);
      });

      mqttClient.on('offline', () => {
        console.warn('⚠️ MQTT desconectado');
        setIsConnected(false);
      });

      mqttClient.on('reconnect', () => {
        console.log('🔄 Reconectando a MQTT...');
      });

      setClient(mqttClient);

      return () => {
        if (mqttClient) {
          mqttClient.end(true);
        }
      };
    } catch (error) {
      console.error('Error inicializando MQTT:', error);
    }
  }, [handleGlobalNotification]);

  const subscribe = useCallback((topic: string, callback: (message: any) => void) => {
    if (client && isConnected) {
      client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Error suscribiéndose a ${topic}:`, err);
        } else {
          console.log(`📡 Suscrito a: ${topic}`);
          subscriptionsRef.current.set(topic, callback);
        }
      });
    }
  }, [client, isConnected]);

  const unsubscribe = useCallback((topic: string) => {
    if (client) {
      client.unsubscribe(topic, (err) => {
        if (err) {
          console.error(`Error desuscribiéndose de ${topic}:`, err);
        } else {
          console.log(`📡 Desuscrito de: ${topic}`);
          subscriptionsRef.current.delete(topic);
        }
      });
    }
  }, [client]);

  const publish = useCallback((topic: string, message: any) => {
    if (client && isConnected) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Error publicando en ${topic}:`, err);
        } else {
          console.log(`📤 Publicado en: ${topic}`);
        }
      });
    }
  }, [client, isConnected]);

  const value: MQTTContextType = {
    client,
    isConnected,
    subscribe,
    unsubscribe,
    publish
  };

  return <MQTTContext.Provider value={value}>{children}</MQTTContext.Provider>;
};
