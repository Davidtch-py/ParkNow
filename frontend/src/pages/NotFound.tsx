import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <AlertCircle className="h-24 w-24 mx-auto text-red-500" />
          </div>

          {/* 404 Text */}
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          
          {/* Message */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Página No Encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>

          {/* Countdown */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Redirigiendo al inicio en{' '}
              <span className="font-bold text-blue-600 text-lg">{countdown}</span>{' '}
              segundos...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleGoHome}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Home className="h-5 w-5 mr-2" />
            Ir al Inicio Ahora
          </button>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Si crees que esto es un error, por favor contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
