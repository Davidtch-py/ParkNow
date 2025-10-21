import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Users,
  FileText,
  LogOut,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/iconParkNow.png';

const Sidebar = () => {
  const location = useLocation();
  const { logout, isAdmin, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Menú simplificado con solo las opciones necesarias para la aplicación ParkNow
  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['admin', 'controlador'] // Todos pueden ver el dashboard
    },
    {
      path: '/parqueaderos',
      name: 'Parqueaderos',
      icon: <Car className="w-5 h-5" />,
      roles: ['admin', 'controlador'] // Todos pueden ver parqueaderos
    },
    {
      path: '/usuarios',
      name: 'Usuarios',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin'] // Solo admin puede gestionar usuarios
    },
    {
      path: '/vehiculos',
      name: 'Vehículos',
      icon: <Car className="w-5 h-5" />,
      roles: ['admin', 'controlador'] // Todos pueden ver vehículos
    },
    {
      path: '/reportes',
      name: 'Reportes',
      icon: <FileText className="w-5 h-5" />,
      roles: ['admin'] // Solo admin puede ver reportes completos
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className={`bg-gray-800 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isSidebarOpen && <h1 className="text-xl font-bold">ParkNow</h1>}
          <button onClick={toggleSidebar} className="p-1 rounded hover:bg-gray-700">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2">
            <ul className="space-y-1">
              {menuItems
                .filter(item => item.roles.includes(user?.rol || 'none')) // Filtrar según rol
                .map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-md transition-colors ${location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700'
                        }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {isSidebarOpen && <span>{item.name}</span>}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`flex items-center rounded-md transition-colors w-full px-4 py-2 text-gray-300 hover:bg-gray-700`}
          >
            <span className="mr-3">
              <LogOut className="w-5 h-5" />
            </span>
            {isSidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;