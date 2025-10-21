import sequelize from './database.js';

export class FestivoRepository {
  async findAll() {
    try {
      const festivos = await sequelize.query(
        `SELECT * FROM festivos ORDER BY fecha`,
        {
          type: sequelize.QueryTypes.SELECT
        }
      );
      return festivos;
    } catch (error) {
      console.error('[ERROR] Error al obtener festivos:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const [festivo] = await sequelize.query(
        `SELECT * FROM festivos WHERE id = $1`,
        {
          bind: [id],
          type: sequelize.QueryTypes.SELECT
        }
      );
      return festivo;
    } catch (error) {
      console.error('[ERROR] Error al obtener festivo:', error);
      throw error;
    }
  }

  async findByYear(year) {
    try {
      const festivos = await sequelize.query(
        `SELECT * FROM festivos 
         WHERE EXTRACT(YEAR FROM fecha) = $1 
         ORDER BY fecha`,
        {
          bind: [year],
          type: sequelize.QueryTypes.SELECT
        }
      );
      return festivos;
    } catch (error) {
      console.error('[ERROR] Error al obtener festivos por año:', error);
      throw error;
    }
  }

  async findByFecha(fecha) {
    try {
      const [festivo] = await sequelize.query(
        `SELECT * FROM festivos WHERE fecha = $1`,
        {
          bind: [fecha],
          type: sequelize.QueryTypes.SELECT
        }
      );
      return festivo;
    } catch (error) {
      console.error('[ERROR] Error al obtener festivo por fecha:', error);
      throw error;
    }
  }

  async create(festivoData) {
    try {
      const { nombre, fecha, descripcion } = festivoData;
      const [result] = await sequelize.query(
        `INSERT INTO festivos (nombre, fecha, descripcion)
         VALUES ($1, $2, $3)
         RETURNING *`,
        {
          bind: [nombre, fecha, descripcion],
          type: sequelize.QueryTypes.INSERT
        }
      );
      return result[0];
    } catch (error) {
      console.error('[ERROR] Error al crear festivo:', error);
      throw error;
    }
  }

  async update(id, festivoData) {
    try {
      const { nombre, fecha, descripcion } = festivoData;
      const [result] = await sequelize.query(
        `UPDATE festivos 
         SET nombre = $1, fecha = $2, descripcion = $3
         WHERE id = $4
         RETURNING *`,
        {
          bind: [nombre, fecha, descripcion, id],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      return result[0];
    } catch (error) {
      console.error('[ERROR] Error al actualizar festivo:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await sequelize.query(
        `DELETE FROM festivos WHERE id = $1`,
        {
          bind: [id],
          type: sequelize.QueryTypes.DELETE
        }
      );
      return true;
    } catch (error) {
      console.error('[ERROR] Error al eliminar festivo:', error);
      throw error;
    }
  }

  async esFestivo(fecha) {
    try {
      const [result] = await sequelize.query(
        `SELECT es_fecha_festivo($1) as es_festivo`,
        {
          bind: [fecha],
          type: sequelize.QueryTypes.SELECT
        }
      );
      return result.es_festivo;
    } catch (error) {
      console.error('[ERROR] Error al verificar festivo:', error);
      throw error;
    }
  }
}
