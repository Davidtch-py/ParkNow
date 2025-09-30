import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {window.location.pathname === '/dashboard' && 'Dashboard'}
            {window.location.pathname === '/parqueaderos' && 'Gestión de Parqueaderos'}
            {window.location.pathname === '/usuarios' && 'Gestión de Usuarios'}
            {window.location.pathname === '/vehiculos' && 'Gestión de Vehículos'}
            {window.location.pathname === '/reportes' && 'Reportes'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <Bell className="h-5 w-5" />
          </button>
          
          <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <Settings className="h-5 w-5" />
          </button>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium text-gray-700">
              {user?.nombre}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;