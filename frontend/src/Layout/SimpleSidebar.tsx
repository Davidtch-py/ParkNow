import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { simpleMenuData } from './SimpleMenuData';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

interface SidebarProps {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
}

const SimpleSidebar = ({ isMobileSidebarOpen, toggleMobileSidebar }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Filtrar elementos del menú según el rol del usuario
  const filteredMenuItems = simpleMenuData.filter((item: any) => {
    // Mostrar títulos siempre
    if (item.isTitle) return true;
    
    // Para administradores mostrar todo
    if (user?.rol === 'admin') return true;
    
    // Para controladores, ocultar la sección de usuarios
    if (user?.rol === 'controlador' && (item.id === 'usuarios' || item.id === 'configuracion')) {
      return false;
    }
    
    return true;
  });

  return (
    <>
      {/* Overlay para dispositivos móviles */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileSidebar}
      />
      
      {/* Sidebar - Fixed en móvil, siempre visible en desktop */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transition-all duration-300 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600">ParkNow</h1>
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none md:hidden"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                {user?.nombre?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium dark:text-white">{user?.nombre || 'Usuario'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.rol === 'admin' ? 'Administrador' : 'Controlador'}
              </p>
            </div>
          </div>
        </div>

        <SimpleBar style={{ maxHeight: 'calc(100vh - 170px)' }}>
          <nav className="px-4 pb-4">
            <ul className="space-y-1">
              {filteredMenuItems.map((item: any, index: number) => {
                // Si es un título de sección
                if (item.isTitle) {
                  return (
                    <li key={`title-${index}`} className="pt-5 pb-2">
                      <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {item.label}
                      </h2>
                    </li>
                  );
                }

                // Si es un elemento de menú normal
                const isActive = location.pathname === item.link;
                
                return (
                  <li key={item.id}>
                    <Link
                      to={item.link}
                      onClick={() => {
                        // En móvil, cerrar el sidebar al hacer clic en un enlace
                        if (window.innerWidth < 768) {
                          toggleMobileSidebar();
                        }
                      }}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className={`mr-3 ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </SimpleBar>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ParkNow
          </p>
        </div>
      </aside>
    </>
  );
};

export default SimpleSidebar;