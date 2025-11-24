/**
 * Script para generar espacios automáticamente para todos los parqueaderos
 */

import sequelize from '../persistence/database.js';

async function generarEspaciosParaTodos() {
  try {
    console.log('🚀 Iniciando generación de espacios...\n');

    // Obtener todos los parqueaderos
    const parqueaderos = await sequelize.query(
      'SELECT id, nombre, capacidad_total FROM parqueaderos ORDER BY id',
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log(`📍 Encontrados ${parqueaderos.length} parqueaderos\n`);

    for (const parqueadero of parqueaderos) {
      console.log(`\n🏢 Procesando: ${parqueadero.nombre}`);
      console.log(`   Capacidad total: ${parqueadero.capacidad_total}`);

      // Verificar cuántos espacios ya existen
      const espaciosExistentes = await sequelize.query(
        'SELECT COUNT(*) as total FROM espacios WHERE id_parqueadero = $1',
        {
          bind: [parqueadero.id],
          type: sequelize.QueryTypes.SELECT
        }
      );

      const totalExistentes = parseInt(espaciosExistentes[0].total);
      console.log(`   Espacios existentes: ${totalExistentes}`);

      if (totalExistentes >= parqueadero.capacidad_total) {
        console.log(`   ✅ Ya tiene todos los espacios generados`);
        continue;
      }

      // Generar los espacios faltantes
      const espaciosACrear = [];
      for (let i = totalExistentes + 1; i <= parqueadero.capacidad_total; i++) {
        espaciosACrear.push({
          codigo_espacio: `E-${String(i).padStart(3, '0')}`,
          estado: 'LIBRE',
          id_parqueadero: parqueadero.id
        });
      }

      console.log(`   📝 Creando ${espaciosACrear.length} espacios...`);

      // Insertar espacios en batch
      if (espaciosACrear.length > 0) {
        await sequelize.query(
          `INSERT INTO espacios (codigo_espacio, estado, id_parqueadero, created_at, updated_at)
           VALUES ${espaciosACrear.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3}, NOW(), NOW())`).join(', ')}`,
          {
            bind: espaciosACrear.flatMap(e => [e.codigo_espacio, e.estado, e.id_parqueadero]),
            type: sequelize.QueryTypes.INSERT
          }
        );

        console.log(`   ✅ Espacios creados exitosamente`);
      }
    }

    console.log('\n\n✨ Proceso completado exitosamente\n');
    
    // Mostrar resumen
    const resumen = await sequelize.query(
      `SELECT 
        p.nombre,
        p.capacidad_total,
        COUNT(e.id) as espacios_creados
       FROM parqueaderos p
       LEFT JOIN espacios e ON p.id = e.id_parqueadero
       GROUP BY p.id, p.nombre, p.capacidad_total
       ORDER BY p.id`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('📊 RESUMEN FINAL:');
    console.log('─'.repeat(60));
    resumen.forEach(r => {
      const porcentaje = ((r.espacios_creados / r.capacidad_total) * 100).toFixed(1);
      console.log(`${r.nombre.padEnd(30)} ${r.espacios_creados}/${r.capacidad_total} (${porcentaje}%)`);
    });
    console.log('─'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar
generarEspaciosParaTodos();
