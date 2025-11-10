import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogOut, Moon, Sun, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SimpleHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { logout, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark', newMode);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-40">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Logo and toggle */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none md:hidden"
          >
            <Menu className="size-5" />
          </button>

          <Link to="/dashboard" className="ml-4">
            <div className="text-xl font-bold text-blue-600">ParkNow</div>
          </Link>
        </div>

        {/* Right side - User profile and actions */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <button
            type="button"
            className="p-2 text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
          >
            <Bell className="size-5" />
            <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none"
            >
              <div className="size-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--park-blue)' }}>
                <User className="size-5 text-blue-600" style={{ color: 'var(--park-black)' }} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.nombre || 'Usuario'}</p>
                <p className="text-xs text-gray-500">{user?.rol || 'Rol'}</p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <Link
                    to="/perfil"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <LogOut className="size-4 mr-2" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;