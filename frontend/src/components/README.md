# 🧩 Componentes de ParkNow

Esta carpeta contiene **componentes reutilizables específicos del dominio de ParkNow**.

## 📋 Propósito

Los componentes aquí son piezas de UI que:
- Se usan en múltiples vistas de ParkNow
- Tienen lógica específica del negocio de parqueaderos
- NO son componentes genéricos (esos van en `/Common/`)

## 🎯 Ejemplos de Componentes a Crear

### Tarjetas
- `VehicleCard.tsx` - Tarjeta para mostrar información de un vehículo
- `ParqueaderoCard.tsx` - Tarjeta para mostrar un parqueadero
- `ControladorCard.tsx` - Tarjeta para mostrar un controlador

### Formularios
- `VehicleForm.tsx` - Formulario de registro de vehículo
- `TarifaForm.tsx` - Formulario de configuración de tarifa
- `HorarioForm.tsx` - Formulario de horarios de atención

### Badges y Estados
- `AlertaBadge.tsx` - Badge para mostrar alertas de capacidad
- `EstadoVehiculo.tsx` - Indicador de estado del vehículo
- `OcupacionBadge.tsx` - Badge de nivel de ocupación

### Tablas y Listas
- `VehiculosTable.tsx` - Tabla de vehículos
- `EntradaSalidaList.tsx` - Lista de entradas/salidas
- `ReporteTable.tsx` - Tabla de reportes

### Widgets
- `OcupacionWidget.tsx` - Widget de ocupación en tiempo real
- `IngresosWidget.tsx` - Widget de ingresos del día
- `AlertasWidget.tsx` - Widget de alertas activas

## 📁 Estructura Recomendada

```
components/
├── cards/
│   ├── VehicleCard.tsx
│   ├── ParqueaderoCard.tsx
│   └── ControladorCard.tsx
├── forms/
│   ├── VehicleForm.tsx
│   ├── TarifaForm.tsx
│   └── HorarioForm.tsx
├── badges/
│   ├── AlertaBadge.tsx
│   └── OcupacionBadge.tsx
├── tables/
│   ├── VehiculosTable.tsx
│   └── ReporteTable.tsx
└── widgets/
    ├── OcupacionWidget.tsx
    └── IngresosWidget.tsx
```

## ✅ Buenas Prácticas

1. **Componentes pequeños y enfocados**
   - Cada componente debe tener una sola responsabilidad

2. **Props bien tipadas**
   ```typescript
   interface VehicleCardProps {
     vehiculo: Vehiculo;
     onEdit?: (id: number) => void;
     onDelete?: (id: number) => void;
   }
   ```

3. **Reutilización**
   - Si un componente se usa en 2+ vistas, debe estar aquí

4. **Documentación**
   - Agregar comentarios JSDoc para props complejas

## 🚫 Lo que NO va aquí

- ❌ Componentes genéricos de UI (van en `/Common/`)
- ❌ Páginas completas (van en `/views/`)
- ❌ Lógica de negocio (va en `/services/`)
- ❌ Layouts (van en `/Layout/`)

## 📝 Ejemplo de Componente

```typescript
import React from 'react';
import { Car } from 'lucide-react';

interface VehicleCardProps {
  placa: string;
  tipo: 'carro' | 'moto' | 'bicicleta';
  propietario: string;
  horaEntrada: string;
  onClick?: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  placa,
  tipo,
  propietario,
  horaEntrada,
  onClick
}) => {
  return (
    <div 
      className="card cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="card-body">
        <div className="flex items-center gap-3">
          <Car className="h-8 w-8 text-blue-500" />
          <div>
            <h5 className="font-semibold">{placa}</h5>
            <p className="text-sm text-gray-500">{propietario}</p>
          </div>
        </div>
        <div className="mt-3">
          <span className="badge badge-soft-primary">{tipo}</span>
          <span className="text-xs text-gray-500 ml-2">{horaEntrada}</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
```

---

**Nota:** Esta carpeta está lista para recibir componentes. A medida que identifiques código repetido en las vistas, extráelo aquí como componente reutilizable.
