import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token de acceso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token inválido' 
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Acceso denegado. Se requieren permisos de administrador' 
    });
  }
  next();
};