import { sequelize, Tarifa } from '../persistence/models.js';

const tarifasData = [
  // Parqueadero Centro (ID: 1)
  { parqueaderoId: 1, tipoVehiculo: 'carro', tarifaHora: 3000, tarifaDia: 25000, tarifaMes: 400000 },
  { parqueaderoId: 1, tipoVehiculo: 'moto', tarifaHora: 1500, tarifaDia: 12000, tarifaMes: 200000 },
  { parqueaderoId: 1, tipoVehiculo: 'bicicleta', tarifaHora: 500, tarifaDia: 3000, tarifaMes: 50000 },
  
  // Parqueadero Norte (ID: 2)
  { parqueaderoId: 2, tipoVehiculo: 'carro', tarifaHora: 3500, tarifaDia: 28000, tarifaMes: 450000 },
  { parqueaderoId: 2, tipoVehiculo: 'moto', tarifaHora: 1800, tarifaDia: 14000, tarifaMes: 220000 },
  { parqueaderoId: 2, tipoVehiculo: 'bicicleta', tarifaHora: 600, tarifaDia: 4000, tarifaMes: 60000 },
  
  // Parqueadero Sur (ID: 3)
  { parqueaderoId: 3, tipoVehiculo: 'carro', tarifaHora: 2800, tarifaDia: 22000, tarifaMes: 380000 },
  { parqueaderoId: 3, tipoVehiculo: 'moto', tarifaHora: 1400, tarifaDia: 11000, tarifaMes: 180000 },
  { parqueaderoId: 3, tipoVehiculo: 'bicicleta', tarifaHora: 400, tarifaDia: 2500, tarifaMes: 40000 },
  
  // Parqueadero Chapinero (ID: 4)
  { parqueaderoId: 4, tipoVehiculo: 'carro', tarifaHora: 4000, tarifaDia: 32000, tarifaMes: 500000 },
  { parqueaderoId: 4, tipoVehiculo: 'moto', tarifaHora: 2000, tarifaDia: 16000, tarifaMes: 250000 },
  { parqueaderoId: 4, tipoVehiculo: 'bicicleta', tarifaHora: 700, tarifaDia: 5000, tarifaMes: 70000 }
];

async function createTarifas() {
  try {
    console.log('🚀 Creando tarifas para parqueaderos...');

    for (const tarifaData of tarifasData) {
      const tarifa = await Tarifa.create({
        ...tarifaData,
        vigenciaDesde: new Date('2024-01-01'),
        vigenciaHasta: new Date('2025-12-31')
      });
      console.log(`✅ Tarifa creada: Parqueadero ${tarifa.parqueaderoId} - ${tarifa.tipoVehiculo} - $${tarifa.tarifaHora}/hora`);
    }

    console.log('🎉 Todas las tarifas creadas exitosamente!');
  } catch (error) {
    console.error('❌ Error creando tarifas:', error);
  } finally {
    await sequelize.close();
  }
}

createTarifas();
