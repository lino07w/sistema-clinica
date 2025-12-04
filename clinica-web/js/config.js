/**
 * Configuración y constantes de la aplicación
 * Centraliza valores para facilitar mantenimiento
 */

const CONFIG = {
  // Credenciales de acceso (En producción, esto vendría del backend)
  AUTH: {
    USERNAME: 'admin',
    PASSWORD: '123456'
  },
  
  // Claves de localStorage
  STORAGE_KEYS: {
    AUTH: 'clinica_auth',
    PACIENTES: 'clinica_pacientes',
    MEDICOS: 'clinica_medicos',
    CITAS: 'clinica_citas',
    USER_DATA: 'clinica_user'
  },
  
  // Rutas de la aplicación
  ROUTES: {
    LOGIN: 'login.html',
    DASHBOARD: 'dashboard.html',
    PACIENTES: 'pacientes.html',
    MEDICOS: 'medicos.html',
    CITAS: 'citas.html'
  },
  
  // Mensajes de error y éxito
  MESSAGES: {
    ERROR: {
      LOGIN_FAILED: 'Usuario o contraseña incorrectos',
      CAMPOS_VACIOS: 'Por favor complete todos los campos',
      DNI_INVALIDO: 'El DNI debe tener 8 dígitos',
      FECHA_INVALIDA: 'La fecha debe ser posterior a hoy',
      ELIMINACION_FALLIDA: 'No se pudo eliminar el registro'
    },
    SUCCESS: {
      GUARDADO: 'Registro guardado exitosamente',
      ACTUALIZADO: 'Registro actualizado exitosamente',
      ELIMINADO: 'Registro eliminado exitosamente'
    }
  },
  
  // Expresiones regulares para validación
  REGEX: {
    DNI: /^\d{8}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TELEFONO: /^\d{9}$/
  }
};

/**
 * Utilidades comunes para toda la aplicación
 */
const Utils = {
  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH) === 'true';
  },
  
  /**
   * Redirige al login si no está autenticado
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = CONFIG.ROUTES.LOGIN;
      return false;
    }
    return true;
  },
  
  /**
   * Cierra sesión y redirige al login
   */
  logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    window.location.href = CONFIG.ROUTES.LOGIN;
  },
  
  /**
   * Muestra un mensaje temporal
   */
  showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message message-${type} show`;
    
    setTimeout(() => {
      messageDiv.className = 'message';
    }, 3000);
  },
  
  /**
   * Valida un DNI
   */
  validarDNI(dni) {
    return CONFIG.REGEX.DNI.test(dni);
  },
  
  /**
   * Valida un email
   */
  validarEmail(email) {
    return CONFIG.REGEX.EMAIL.test(email);
  },
  
  /**
   * Valida un teléfono
   */
  validarTelefono(telefono) {
    return CONFIG.REGEX.TELEFONO.test(telefono);
  },
  
  /**
   * Formatea una fecha a formato local
   */
  formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  /**
   * Limpia un formulario
   */
  limpiarFormulario(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
  },
  
  /**
   * Genera un ID único
   */
  generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, Utils };
}
