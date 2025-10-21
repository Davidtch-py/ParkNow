# 🔧 Services - Servicios de API

Esta carpeta contiene la **lógica de comunicación con el backend** y manejo de datos.

## 🎯 Propósito

Los servicios son responsables de:
- Hacer peticiones HTTP al backend
- Transformar datos entre frontend y backend
- Manejar errores de API
- Centralizar la lógica de negocio relacionada con datos

## 📋 Servicios Actuales

### Servicios Implementados

- **`parqueaderoService.ts`** - Gestión de parqueaderos
  - `getAll()` - Obtener todos los parqueaderos
  - `getById(id)` - Obtener parqueadero por ID
  - `create(data)` - Crear nuevo parqueadero
  - `update(id, data)` - Actualizar parqueadero
  - `delete(id)` - Eliminar parqueadero

- **`usuarioService.ts`** - Gestión de usuarios/controladores
  - `getAll()` - Obtener todos los usuarios
  - `getById(id)` - Obtener usuario por ID
  - `create(data)` - Crear nuevo usuario
  - `update(id, data)` - Actualizar usuario
  - `delete(id)` - Eliminar usuario

- **`entradaService.ts`** - Registro de entradas de vehículos
  - `registrar(data)` - Registrar entrada
  - `getAll()` - Obtener todas las entradas
  - `getActivas(parqueaderoId)` - Obtener entradas activas

- **`salidaService.ts`** - Registro de salidas de vehículos
  - `registrar(data)` - Registrar salida
  - `getAll()` - Obtener todas las salidas
  - `calcularTarifa(entradaId)` - Calcular tarifa de salida

- **`tarifaService.ts`** - Gestión de tarifas
  - `getAll()` - Obtener todas las tarifas
  - `getByParqueadero(id)` - Obtener tarifas por parqueadero
  - `create(data)` - Crear nueva tarifa
  - `update(id, data)` - Actualizar tarifa
  - `delete(id)` - Eliminar tarifa

- **`reporteService.ts`** - Generación de reportes
  - `generar(filtros)` - Generar reporte
  - `exportar(id, formato)` - Exportar reporte
  - `getAll()` - Obtener reportes guardados

- **`index.ts`** - Exportaciones centralizadas

## 📐 Estructura de un Servicio

```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface ResponseFormat<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ParqueaderoService {
  private baseUrl = `${API_URL}/parqueaderos`;

  async getAll(): Promise<ResponseFormat<Parqueadero[]>> {
    try {
      const response = await axios.get(this.baseUrl);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener parqueaderos',
      };
    }
  }

  async getById(id: number): Promise<ResponseFormat<Parqueadero>> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener parqueadero',
      };
    }
  }

  async create(data: Partial<Parqueadero>): Promise<ResponseFormat<Parqueadero>> {
    try {
      const response = await axios.post(this.baseUrl, data);
      return {
        success: true,
        data: response.data,
        message: 'Parqueadero creado exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear parqueadero',
      };
    }
  }

  async update(id: number, data: Partial<Parqueadero>): Promise<ResponseFormat<Parqueadero>> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, data);
      return {
        success: true,
        data: response.data,
        message: 'Parqueadero actualizado exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar parqueadero',
      };
    }
  }

  async delete(id: number): Promise<ResponseFormat<void>> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
      return {
        success: true,
        message: 'Parqueadero eliminado exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar parqueadero',
      };
    }
  }
}

export const parqueaderoService = new ParqueaderoService();
```

## ✅ Buenas Prácticas

1. **Formato de respuesta consistente**
   ```typescript
   interface ResponseFormat<T> {
     success: boolean;
     data?: T;
     message?: string;
     error?: string;
   }
   ```

2. **Manejo de errores**
   - Siempre usar try-catch
   - Retornar mensajes de error descriptivos
   - No lanzar excepciones, retornar objeto con success: false

3. **Tipado fuerte**
   - Definir interfaces para todas las entidades
   - Tipar parámetros y valores de retorno

4. **Singleton pattern**
   - Exportar una instancia única del servicio
   ```typescript
   export const parqueaderoService = new ParqueaderoService();
   ```

5. **Configuración centralizada**
   - URL base desde variables de entorno
   - Headers comunes en un interceptor

## 🔐 Autenticación

Para agregar autenticación a las peticiones:

```typescript
// Configurar interceptor de Axios
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## 📝 Uso en Componentes

```typescript
import { parqueaderoService } from '../services';

const MiComponente = () => {
  const [parqueaderos, setParqueaderos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarParqueaderos = async () => {
    setLoading(true);
    const result = await parqueaderoService.getAll();
    
    if (result.success) {
      setParqueaderos(result.data || []);
      toast.success('Datos cargados');
    } else {
      toast.error(result.error || 'Error al cargar datos');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    cargarParqueaderos();
  }, []);

  return (
    // JSX
  );
};
```

## 🚫 Lo que NO va aquí

- ❌ Componentes de UI
- ❌ Lógica de presentación
- ❌ Estado de componentes
- ❌ Validaciones de formularios (van en los componentes)

## 📦 Exportación Centralizada

El archivo `index.ts` debe exportar todos los servicios:

```typescript
export { parqueaderoService } from './parqueaderoService';
export { usuarioService } from './usuarioService';
export { entradaService } from './entradaService';
export { salidaService } from './salidaService';
export { tarifaService } from './tarifaService';
export { reporteService } from './reporteService';
```

Uso:
```typescript
import { parqueaderoService, usuarioService } from '../services';
```

---

**Convención de nombres:** `camelCase.ts` (ej: `parqueaderoService.ts`)
