import { FestivoRepository } from '../persistence/FestivoRepository.js';

const festivoRepository = new FestivoRepository();

class FestivosApiService {
  constructor() {
    this.apiUrl = 'https://api-colombia.com/api/v1/Holiday/year';
  }

  /**
   * Sincronizar festivos desde la API de Colombia
   */
  async sincronizarFestivos(year) {
    try {
      console.log(`📅 Sincronizando festivos de Colombia para el año ${year}...`);
      
      const response = await fetch(`${this.apiUrl}/${year}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener festivos: ${response.status}`);
      }

      const festivos = await response.json();
      
      let insertados = 0;
      let actualizados = 0;
      let errores = 0;

      for (const festivo of festivos) {
        try {
          // Convertir fecha ISO a formato YYYY-MM-DD
          const fecha = festivo.date.split('T')[0];
          
          // Intentar crear el festivo
          await festivoRepository.create({
            nombre: festivo.name,
            fecha: fecha,
            descripcion: `Festivo oficial de Colombia - ${festivo.name}`
          });
          
          insertados++;
          console.log(`  ✅ Insertado: ${festivo.name} - ${fecha}`);
        } catch (error) {
          // Si ya existe (error de unique constraint), intentar actualizar
          if (error.name === 'SequelizeUniqueConstraintError' || 
              error.message?.includes('duplicate key')) {
            try {
              // Buscar el festivo existente por fecha
              const existente = await festivoRepository.findByFecha(fecha);
              if (existente) {
                await festivoRepository.update(existente.id, {
                  nombre: festivo.name,
                  fecha: fecha,
                  descripcion: `Festivo oficial de Colombia - ${festivo.name}`
                });
                actualizados++;
                console.log(`  🔄 Actualizado: ${festivo.name} - ${fecha}`);
              }
            } catch (updateError) {
              errores++;
              console.error(`  ❌ Error al actualizar ${festivo.name}:`, updateError.message);
            }
          } else {
            errores++;
            console.error(`  ❌ Error al insertar ${festivo.name}:`, error.message);
          }
        }
      }

      console.log(`\n📊 Resumen de sincronización ${year}:`);
      console.log(`   ✅ Insertados: ${insertados}`);
      console.log(`   🔄 Actualizados: ${actualizados}`);
      console.log(`   ❌ Errores: ${errores}`);
      console.log(`   📝 Total procesados: ${festivos.length}`);

      return {
        success: true,
        year,
        total: festivos.length,
        insertados,
        actualizados,
        errores
      };
    } catch (error) {
      console.error(`❌ Error al sincronizar festivos del año ${year}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sincronizar festivos de múltiples años
   */
  async sincronizarMultiplesAnios(years) {
    const resultados = [];
    
    for (const year of years) {
      const resultado = await this.sincronizarFestivos(year);
      resultados.push(resultado);
    }
    
    return resultados;
  }

  /**
   * Sincronizar festivos del año actual y siguiente
   */
  async sincronizarActualYSiguiente() {
    const currentYear = new Date().getFullYear();
    return await this.sincronizarMultiplesAnios([currentYear, currentYear + 1]);
  }
}

export const festivosApiService = new FestivosApiService();
