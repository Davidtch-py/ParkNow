import React from 'react';
import { useAuth } from '../context/AuthContext';

const Usuarios = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="card text-center">
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores pueden acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Gestión de Usuarios</h1>
      
      <div className="card">
        <h2>🚧 En Desarrollo</h2>
        <p>Esta funcionalidad se implementará próximamente. Incluirá:</p>
        
        <ul style={{ margin: '20px 0', paddingLeft: '20px' }}>
          <li>Lista de usuarios registrados</li>
          <li>Crear nuevos controladores</li>
          <li>Editar información de usuarios</li>
          <li>Gestionar roles y permisos</li>
          <li>Activar/desactivar usuarios</li>
        </ul>
        
        <div className="alert alert-warning">
          <strong>Nota:</strong> Actualmente puedes usar las credenciales de prueba 
          proporcionadas en el login para acceder como diferentes tipos de usuarios.
        </div>
      </div>
    </div>
  );
};

export default Usuarios;