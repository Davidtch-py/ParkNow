import { Reporte, Registro, Vehiculo, Espacio, Parqueadero, Usuario } from './models.js';
import { Op } from 'sequelize';

export class ReportesRepository {
    // Método para crear un nuevo reporte
    async create(reporteData) {
        try {
            const reporte = await Reporte.create(reporteData);
            return reporte;
        } catch (error) {
            console.error('Error en ReportesRepository.create:', error);
            throw error;
        }
    }

    // Método para obtener todos los reportes
    async findAll() {
        try {
            const reportes = await Reporte.findAll({
                include: [{
                    model: Parqueadero,
                    as: 'parqueadero',
                    attributes: ['nombre', 'direccion']
                }],
                order: [['fecha_generacion', 'DESC']]
            });

            return reportes;
        } catch (error) {
            console.error('Error en ReportesRepository.findAll:', error);
            throw error;
        }
    }

    // Método para obtener un reporte por ID
    async findById(id) {
        try {
            const reporte = await Reporte.findByPk(id, {
                include: [{
                    model: Parqueadero,
                    as: 'parqueadero',
                    attributes: ['nombre', 'direccion']
                }]
            });
            return reporte;
        } catch (error) {
            console.error('Error en ReportesRepository.findById:', error);
            throw error;
        }
    }

    // Método para obtener reportes por rango de fechas
    async findByDateRange(fechaInicio, fechaFin) {
        try {
            const reportes = await Reporte.findAll({
                where: {
                    fecha_inicio: { [Op.gte]: fechaInicio },
                    fecha_fin: { [Op.lte]: fechaFin }
                },
                include: [{
                    model: Parqueadero,
                    as: 'parqueadero',
                    attributes: ['nombre', 'direccion']
                }],
                order: [['fecha_generacion', 'DESC']]
            });
            return reportes;
        } catch (error) {
            console.error('Error en ReportesRepository.findByDateRange:', error);
            throw error;
        }
    }

    // Método para actualizar el estado de un reporte
    async updateEstado(id, nuevoEstado) {
        try {
            const reporte = await Reporte.findByPk(id);
            if (!reporte) {
                throw new Error('Reporte no encontrado');
            }
            reporte.estado = nuevoEstado;
            await reporte.save();
            return reporte;
        } catch (error) {
            console.error('Error en ReportesRepository.updateEstado:', error);
            throw error;
        }
    }
}