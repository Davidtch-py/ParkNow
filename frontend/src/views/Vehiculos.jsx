import React from 'react';

const Vehiculos = () => {
  return (
    <div>
      <h1>Gestión de Vehículos</h1>
      
      <div className="card">
        <h2>🚧 En Desarrollo</h2>
        <p>Esta funcionalidad se implementará próximamente. Incluirá:</p>
        
        <ul style={{ margin: '20px 0', paddingLeft: '20px' }}>
          <li>Registro de nuevos vehículos</li>
          <li>Lista de vehículos registrados</li>
          <li>Búsqueda por placa</li>
          <li>Editar información de vehículos</li>
          <li>Historial de entradas y salidas por vehículo</li>
          <li>Gestión de propietarios</li>
        </ul>
        
        <div className="alert alert-warning">
          <strong>Nota:</strong> Los vehículos de prueba ya están cargados en la base 
          de datos y pueden ser utilizados para registrar entradas y salidas.
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Vehículos de Prueba Disponibles:</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Propietario</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ABC123</td>
                <td>Carro</td>
                <td>Toyota</td>
                <td>Corolla</td>
                <td>Pedro Martínez</td>
              </tr>
              <tr>
                <td>DEF456</td>
                <td>Carro</td>
                <td>Chevrolet</td>
                <td>Aveo</td>
                <td>Ana López</td>
              </tr>
              <tr>
                <td>GHI789</td>
                <td>Moto</td>
                <td>Yamaha</td>
                <td>FZ150</td>
                <td>Luis Sánchez</td>
              </tr>
              <tr>
                <td>JKL012</td>
                <td>Moto</td>
                <td>Honda</td>
                <td>CB125</td>
                <td>Carmen Ruiz</td>
              </tr>
              <tr>
                <td>PQR678</td>
                <td>Bicicleta</td>
                <td>Trek</td>
                <td>Mountain</td>
                <td>Sofia Morales</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vehiculos;