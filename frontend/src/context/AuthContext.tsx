import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/index';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'CONTROLADOR' | 'admin' | 'controlador';
  activo?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la app
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Si hay error, limpiar localStorage
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 AuthContext: Iniciando login para:', email);
      
      const result = await authService.login(email, password);
      console.log('📋 AuthContext: Resultado del login:', result);
      
      if (result.success) {
        setUser(result.usuario);
        console.log('✅ AuthContext: Usuario autenticado:', result.usuario);
        return { success: true };
      } else {
        console.log('❌ AuthContext: Login falló:', result.error);
        // NO lanzar excepción, solo retornar el error
        return { success: false, error: result.error || 'Credenciales inválidas' };
      }
    } catch (error: any) {
      console.error('💥 AuthContext: Error inesperado en login:', error);
      
      // Determinar el tipo de error
      let errorMessage = 'Error de conexión';
      
      if (error.message?.includes('fetch')) {
        errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté corriendo.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Servidor no disponible. Verifica que el backend esté corriendo en puerto 3000.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // NO usar window.location.href para evitar recargas forzadas
    console.log('🚪 Usuario desconectado');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.rol === 'admin' || user?.rol === 'ADMIN';

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};