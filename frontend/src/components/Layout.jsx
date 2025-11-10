import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Car, Users, BarChart3, Settings } from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="flex flex-between">
            <NavLink to="/" className="navbar-brand">
              🚗 ParkNow
            </NavLink>
            
            <ul className="navbar-nav flex">
              <li>
                <NavLink to="/dashboard" className="nav-link">
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/parqueaderos" className="nav-link">
                  <Car size={16} className="mr-5" />
                  Parqueaderos
                </NavLink>
              </li>
              {isAdmin && (
                <li>
                  <NavLink to="/usuarios" className="nav-link">
                    <Users size={16} className="mr-5" />
                    Usuarios
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/vehiculos" className="nav-link">
                  Vehículos
                </NavLink>
              </li>
              <li>
                <NavLink to="/reportes" className="nav-link">
                  <BarChart3 size={16} className="mr-5" />
                  Reportes
                </NavLink>
              </li>
            </ul>

            <div className="flex gap-10">
              <span className="nav-link">
                👤 {user?.nombre} ({user?.rol})
              </span>
              <button 
                onClick={logout}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;