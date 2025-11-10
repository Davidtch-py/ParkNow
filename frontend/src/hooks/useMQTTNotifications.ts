import { useEffect } from 'react';
import { useMQTT } from '../contexts/MQTTContext';

/**
 * Hook para suscribirse automáticamente a notificaciones MQTT
 * según el rol del usuario
 */
export const useMQTTNotifications = () => {
  const { subscribe, unsubscribe, isConnected } = useMQTT();

  useEffect(() => {
    if (!isConnected) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const topics: string[] = [];

    // Topics comunes para todos los usuarios autenticados
    if (user.id) {
      // Notificaciones generales
      topics.push('parknow/notificaciones/general');
    }

    // Topics específicos por rol
    if (user.rol === 'admin') {
      // Admin recibe todas las notificaciones
      topics.push('parknow/notificaciones/capacidad');
      topics.push('parknow/notificaciones/entradas');
      topics.push('parknow/notificaciones/salidas');
      topics.push('parknow/notificaciones/alertas');
    } else if (user.rol === 'controlador') {
      // Controladores reciben notificaciones de sus parqueaderos
      topics.push('parknow/notificaciones/capacidad');
      topics.push('parknow/notificaciones/entradas');
      topics.push('parknow/notificaciones/salidas');
      
      // Si tiene parqueaderos asignados, suscribirse a topics específicos
      if (user.parqueaderos && Array.isArray(user.parqueaderos)) {
        user.parqueaderos.forEach((parqueaderoId: number) => {
          topics.push(`parknow/parqueadero/${parqueaderoId}/capacidad`);
          topics.push(`parknow/parqueadero/${parqueaderoId}/entradas`);
          topics.push(`parknow/parqueadero/${parqueaderoId}/salidas`);
        });
      }
    }

    // Suscribirse a todos los topics
    topics.forEach(topic => {
      subscribe(topic, (message) => {
        console.log(`Notificación recibida en ${topic}:`, message);
      });
    });

    // Cleanup: desuscribirse al desmontar
    return () => {
      topics.forEach(topic => {
        unsubscribe(topic);
      });
    };
  }, [isConnected, subscribe, unsubscribe]);
};
