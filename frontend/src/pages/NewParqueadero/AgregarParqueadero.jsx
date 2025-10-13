import React, { useState } from 'react';
import { MapPin, Car, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AgregarParqueadero = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    capacidadTotal: '',
    ciudad: ''
  });

  const [mensaje, setMensaje] = useState(null);
  //const { token } = useAuth(); // Asegúrate que useAuth devuelve el token
  const token = localStorage.getItem('token');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.ciudad) {
        setMensaje({ tipo: 'error', texto: 'Debes seleccionar una ciudad' });
        return;
      }
      console.log('Datos recibidos en repositorio:', formData);
      const response = await axios.post('http://localhost:3000/api/parqueaderos', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Código de estado:', response.status);

      if (response?.status >= 200 && response?.status < 300) {
        setMensaje({ tipo: 'success', texto: 'Parqueadero creado exitosamente ✅' });
        setFormData({
          nombre: '',
          direccion: '',
          capacidadTotal: '',
          ciudad: ''
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        const mensajeError = response?.data?.error || 'Respuesta inesperada del servidor ⚠️';
        setMensaje({ tipo: 'error', texto: `Error: ${mensajeError}` });
      }

    } catch (error) {
      console.error('Error capturado:', error);

      if (error.response) {
        setMensaje({
          tipo: 'error',
          texto: `Error del servidor: ${error.response.data?.error || 'Respuesta inválida'}`
        });
      } else if (error.request) {
        setMensaje({
          tipo: 'error',
          texto: 'No hubo respuesta del servidor ❌'
        });
      } else {
        setMensaje({
          tipo: 'error',
          texto: 'Error inesperado al enviar la solicitud ⚠️'
        });
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Car className="text-blue-600" /> Agregar Parqueadero
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Capacidad Total</label>
          <input
            type="number"
            name="capacidadTotal"
            value={formData.capacidadTotal}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ciudad</label>
          <select
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Selecciona una ciudad</option>
            <option value="Tunja">Tunja</option>
            <option value="Duitama">Duitama</option>
            <option value="Sogamoso">Sogamoso</option>
            <option value="Chiquinquirá">Chiquinquirá</option>
            <option value="Paipa">Paipa</option>
            <option value="Villa de Leyva">Villa de Leyva</option>
            <option value="Moniquirá">Moniquirá</option>
            <option value="Samacá">Samacá</option>
            <option value="Tibasosa">Tibasosa</option>
            <option value="Soatá">Soatá</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Crear Parqueadero
        </button>
      </form>

      {mensaje && (
        <div
          className={`mt-4 p-3 rounded-md flex items-center gap-2 ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
        >
          {mensaje.tipo === 'success' ? <CheckCircle /> : <AlertTriangle />}
          <span>{mensaje.texto}</span>
        </div>
      )}
    </div>
  );
};

export default AgregarParqueadero;