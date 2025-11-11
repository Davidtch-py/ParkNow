import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface ParqueaderoAlerta {
  id: number;
  nombre: string;
  porcentajeOcupacion: number;
  ocupados: number;
  capacidadTotal: number;
}

interface AlertasCapacidadProps {
  parqueaderos: ParqueaderoAlerta[];
}

export const AlertasCapacidad: React.FC<AlertasCapacidadProps> = ({ parqueaderos }) => {
  const [alertasActivas, setAlertasActivas] = useState<ParqueaderoAlerta[]>([]);

  useEffect(() => {
    // Verificar alertas de capacidad
    const nuevasAlertas = parqueaderos.filter(p => p.porcentajeOcupacion >= 80);

    // Mostrar notificaciones para nuevas alertas
    nuevasAlertas.forEach(alerta => {
      if (alerta.porcentajeOcupacion >= 95) {
        toast.error(
          `⚠️ ${alerta.nombre} LLENO (${alerta.porcentajeOcupacion}%) - ${alerta.ocupados}/${alerta.capacidadTotal}`,
          { autoClose: 5000 }
        );
      } else if (alerta.porcentajeOcupacion >= 90) {
        toast.warning(
          `⚠️ ${alerta.nombre} casi lleno (${alerta.porcentajeOcupacion}%) - ${alerta.ocupados}/${alerta.capacidadTotal}`,
          { autoClose: 5000 }
        );
      } else if (alerta.porcentajeOcupacion >= 80) {
        toast.info(
          `ℹ️ ${alerta.nombre} al ${alerta.porcentajeOcupacion}% de capacidad`,
          { autoClose: 5000 }
        );
      }
    });

    setAlertasActivas(nuevasAlertas);
  }, [parqueaderos]);

  if (alertasActivas.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {alertasActivas.map(alerta => {
        let bgColor = 'bg-yellow-50 border-yellow-200';
        let iconColor = 'text-yellow-600';
        let Icon = AlertCircle;

        if (alerta.porcentajeOcupacion >= 95) {
          bgColor = 'bg-red-50 border-red-200';
          iconColor = 'text-red-600';
          Icon = AlertTriangle;
        } else if (alerta.porcentajeOcupacion >= 90) {
          bgColor = 'bg-orange-50 border-orange-200';
          iconColor = 'text-orange-600';
          Icon = AlertTriangle;
        }

        return (
          <div key={alerta.id} className={`border ${bgColor} rounded-lg p-4 flex items-start gap-3`}>
            <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{alerta.nombre}</h4>
              <p className="text-sm text-gray-600 mt-1">
                Capacidad: {alerta.ocupados}/{alerta.capacidadTotal} espacios ({alerta.porcentajeOcupacion}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    alerta.porcentajeOcupacion >= 95
                      ? 'bg-red-600'
                      : alerta.porcentajeOcupacion >= 90
                      ? 'bg-orange-600'
                      : 'bg-yellow-600'
                  }`}
                  style={{ width: `${alerta.porcentajeOcupacion}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertasCapacidad;
