import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Parqueaderos from './views/Parqueaderos';
import Usuarios from './views/Usuarios';
import Vehiculos from './views/Vehiculos';
import Reportes from './views/Reportes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="parqueaderos" element={<Parqueaderos />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="vehiculos" element={<Vehiculos />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;