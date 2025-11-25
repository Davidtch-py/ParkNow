import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para filtrar parqueaderos según los permisos del usuario
 * - ADMIN: ve todos los parqueaderos
 * - CONTROLADOR: solo ve los parqueaderos asignados
 */
export const useParqueaderosPermitidos = <T extends { id: number }>(parqueaderos: T[]): T[] => {
  const { user, isAdmin, parqueaderosAsignados } = useAuth();

  return useMemo(() => {
    // Si no hay usuario, no mostrar nada
    if (!user) return [];

    // Si es admin, mostrar todos
    if (isAdmin) return parqueaderos;

    // Si es controlador, filtrar por asignados
    if (parqueaderosAsignados.length === 0) {
      console.warn('[useParqueaderosPermitidos] Controlador sin parqueaderos asignados');
      return [];
    }

    return parqueaderos.filter(p => parqueaderosAsignados.includes(p.id));
  }, [parqueaderos, user, isAdmin, parqueaderosAsignados]);
};

/**
 * Hook para verificar si el usuario tiene acceso a un parqueadero específico
 */
export const useTieneAccesoParqueadero = () => {
  const { tieneAccesoParqueadero } = useAuth();
  return tieneAccesoParqueadero;
};
