import express from 'express';
import bcrypt from 'bcryptjs';
import { Usuario } from './persistence/models.js';

const router = express.Router();

// Endpoint para crear un usuario administrador de prueba
router.post('/setup-admin', async (req, res) => {
  try {
    // Comprobar si ya existe un usuario con ese email
    const existingUser = await Usuario.findOne({ 
      where: { email: 'admin@parqueadero.com' }
    });

    if (existingUser) {
      // Actualizar la contraseña si el usuario ya existe
      const hashedPassword = await bcrypt.hash('password', 10);
      await existingUser.update({ 
        password: hashedPassword,
        nombre: 'Admin Principal',
        apellido: 'Admin',
        documento: 'ADMIN001',
        rol: 'ADMIN'
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Usuario administrador actualizado correctamente',
        email: 'admin@parqueadero.com',
        password: 'password',
        hashedPassword
      });
    }

    // Si no existe, crear uno nuevo
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const nuevoUsuario = await Usuario.create({
      nombre: 'Admin Principal',
      apellido: 'Admin',
      documento: 'ADMIN001',
      email: 'admin@parqueadero.com',
      password: hashedPassword,
      rol: 'ADMIN',
      telefono: '1234567890'
    });

    res.status(201).json({
      success: true,
      message: 'Usuario administrador creado correctamente',
      email: 'admin@parqueadero.com',
      password: 'password',
      hashedPassword
    });
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
    res.status(500).json({
      success: false,
      error: `Error al crear usuario: ${error.message}`
    });
  }
});

// Endpoint para crear un usuario controlador de prueba
router.post('/setup-controlador', async (req, res) => {
  try {
    // Comprobar si ya existe un usuario con ese email
    const existingUser = await Usuario.findOne({ 
      where: { email: 'juan.perez@parqueadero.com' }
    });

    if (existingUser) {
      // Actualizar la contraseña si el usuario ya existe
      const hashedPassword = await bcrypt.hash('password', 10);
      await existingUser.update({ 
        password: hashedPassword,
        nombre: 'Juan',
        apellido: 'Pérez',
        documento: 'CTRL001',
        rol: 'CONTROLADOR'
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Usuario controlador actualizado correctamente',
        email: 'juan.perez@parqueadero.com',
        password: 'password',
        hashedPassword
      });
    }

    // Si no existe, crear uno nuevo
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const nuevoUsuario = await Usuario.create({
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: 'CTRL001',
      email: 'juan.perez@parqueadero.com',
      password: hashedPassword,
      rol: 'CONTROLADOR',
      telefono: '1234567890'
    });

    res.status(201).json({
      success: true,
      message: 'Usuario controlador creado correctamente',
      email: 'juan.perez@parqueadero.com',
      password: 'password',
      hashedPassword
    });
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
    res.status(500).json({
      success: false,
      error: `Error al crear usuario: ${error.message}`
    });
  }
});

export default router;