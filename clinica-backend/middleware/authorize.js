export const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

export const isAdmin = authorize('administrador');
export const isAdminOrRecepcionista = authorize('administrador', 'recepcionista');
export const isAdminOrMedico = authorize('administrador', 'medico');
export const isStaff = authorize('administrador', 'medico', 'recepcionista');
export const isAnyRole = authorize('administrador', 'medico', 'recepcionista', 'paciente');