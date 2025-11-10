import React, { useState } from 'react';
import { authService } from '../services/index';

const TestConnection: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResult('Probando conexión...');
    
    try {
      // Hacer una petición directa a la API usando la variable de entorno
      const apiUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ Backend conectado: ${data.message}`);
      } else {
        setTestResult('❌ Backend no responde correctamente');
      }
    } catch (error) {
      setTestResult(`❌ Error de conexión: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setTestResult('Probando login...');
    
    try {
      const result = await authService.login('admin@parqueadero.com', 'password');
      
      if (result.success) {
        setTestResult(`✅ Login exitoso: Usuario ${result.usuario.nombre} (${result.usuario.rol})`);
      } else {
        setTestResult(`❌ Login falló: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error en login: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4">🔧 Test de Conexión</h3>
      
      <div className="space-y-3">
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Probando...' : 'Probar Backend'}
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Probando...' : 'Probar Login'}
        </button>
      </div>
      
      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          {testResult}
        </div>
      )}
    </div>
  );
};

export default TestConnection;