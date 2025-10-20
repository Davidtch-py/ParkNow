import React from 'react';
import './assets/scss/themes.scss';
import RouteIndex from 'Routes/Index';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMQTTNotifications } from './hooks/useMQTTNotifications';



function App() {
  // Activar notificaciones MQTT globales
  useMQTTNotifications();

  return (
    <AuthProvider>
      <RouteIndex />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;
