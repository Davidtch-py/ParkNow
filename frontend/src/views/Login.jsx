import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error);
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-20">
          <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
            🚗 ParkNow
          </h1>
          <p style={{ color: '#666' }}>Sistema de Gestión de Parqueaderos</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@parqueadero.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              'Iniciando sesión...'
            ) : (
              <>
                <LogIn size={16} style={{ marginRight: '8px' }} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="mt-20" style={{ fontSize: '14px', color: '#666' }}>
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Admin: admin@parqueadero.com / secret</p>
          <p>Controlador: juan.perez@parqueadero.com / secret</p>
        </div>
      </div>
    </div>
  );
};

export default Login;