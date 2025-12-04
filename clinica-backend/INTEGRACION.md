# 🔗 Guía de Integración Frontend-Backend

Esta guía te ayudará a conectar el frontend HTML/CSS/JS con el backend Node.js.

## 📋 Pre-requisitos

1. ✅ Frontend funcionando (HTML/CSS/JS)
2. ✅ Backend instalado (`npm install`)
3. ✅ Variables de entorno configuradas (`.env`)

## 🚀 Pasos de Integración

### 1. Iniciar el Backend

```bash
cd clinica-backend
npm run dev
```

Deberías ver:
```
✅ Servidor corriendo en puerto 3000
🌍 Entorno: development
🔗 URL: http://localhost:3000
```

### 2. Actualizar Frontend para Usar la API

Necesitas modificar los archivos JS del frontend para que llamen al backend en lugar de usar localStorage.

#### A. Actualizar `config.js`

Agregar configuración de API:

```javascript
const CONFIG = {
  // ... (mantener configuración existente)
  
  // Nueva configuración de API
  API: {
    BASE_URL: 'http://localhost:3000/api',
    ENDPOINTS: {
      LOGIN: '/auth/login',
      ME: '/auth/me',
      PACIENTES: '/pacientes',
      MEDICOS: '/medicos',
      CITAS: '/citas'
    }
  }
};
```

#### B. Crear Módulo de API (`api.js`)

Crear nuevo archivo `js/api.js`:

```javascript
/**
 * Módulo de comunicación con la API
 */

class API {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
    this.token = localStorage.getItem('token');
  }

  /**
   * Petición genérica a la API
   */
  async request(endpoint, method = 'GET', data = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Agregar token si existe
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options = {
      method,
      headers
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error en la petición');
      }

      return result;
    } catch (error) {
      console.error('Error en API:', error);
      throw error;
    }
  }

  // Métodos de autenticación
  async login(username, password) {
    const result = await this.request(CONFIG.API.ENDPOINTS.LOGIN, 'POST', {
      username,
      password
    });
    
    // Guardar token
    this.token = result.data.token;
    localStorage.setItem('token', this.token);
    
    return result;
  }

  async getMe() {
    return await this.request(CONFIG.API.ENDPOINTS.ME);
  }

  // Métodos de pacientes
  async getPacientes() {
    return await this.request(CONFIG.API.ENDPOINTS.PACIENTES);
  }

  async createPaciente(data) {
    return await this.request(CONFIG.API.ENDPOINTS.PACIENTES, 'POST', data);
  }

  async updatePaciente(id, data) {
    return await this.request(`${CONFIG.API.ENDPOINTS.PACIENTES}/${id}`, 'PUT', data);
  }

  async deletePaciente(id) {
    return await this.request(`${CONFIG.API.ENDPOINTS.PACIENTES}/${id}`, 'DELETE');
  }

  // Métodos de médicos
  async getMedicos() {
    return await this.request(CONFIG.API.ENDPOINTS.MEDICOS);
  }

  async createMedico(data) {
    return await this.request(CONFIG.API.ENDPOINTS.MEDICOS, 'POST', data);
  }

  async updateMedico(id, data) {
    return await this.request(`${CONFIG.API.ENDPOINTS.MEDICOS}/${id}`, 'PUT', data);
  }

  async deleteMedico(id) {
    return await this.request(`${CONFIG.API.ENDPOINTS.MEDICOS}/${id}`, 'DELETE');
  }

  // Métodos de citas
  async getCitas() {
    return await this.request(CONFIG.API.ENDPOINTS.CITAS);
  }

  async createCita(data) {
    return await this.request(CONFIG.API.ENDPOINTS.CITAS, 'POST', data);
  }

  async updateCita(id, data) {
    return await this.request(`${CONFIG.API.ENDPOINTS.CITAS}/${id}`, 'PUT', data);
  }

  async deleteCita(id) {
    return await this.request(`${CONFIG.API.ENDPOINTS.CITAS}/${id}`, 'DELETE');
  }
}

// Exportar instancia
const api = new API();
```

#### C. Actualizar `login.js`

Cambiar para usar la API:

```javascript
async handleLogin() {
  const username = this.userInput.value.trim();
  const password = this.passInput.value;

  if (!this.validateInputs(username, password)) {
    return;
  }

  this.setLoading(true);

  try {
    // Usar la API en lugar de validación local
    const result = await api.login(username, password);
    
    // Guardar datos del usuario
    localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH, 'true');
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(result.data.user));
    
    this.handleSuccessfulLogin(username);
  } catch (error) {
    this.handleFailedLogin();
  }

  this.setLoading(false);
}
```

#### D. Actualizar `pacientes.js`

Cambiar métodos para usar la API:

```javascript
async cargarPacientes() {
  try {
    const result = await api.getPacientes();
    this.pacientes = result.data;
    this.renderTable();
  } catch (error) {
    Utils.showMessage('Error al cargar pacientes', 'error');
  }
}

async guardarPaciente() {
  // ... validaciones ...

  try {
    if (this.editingId) {
      await api.updatePaciente(this.editingId, paciente);
      Utils.showMessage(CONFIG.MESSAGES.SUCCESS.ACTUALIZADO, 'success');
    } else {
      await api.createPaciente(paciente);
      Utils.showMessage(CONFIG.MESSAGES.SUCCESS.GUARDADO, 'success');
    }
    
    await this.cargarPacientes();
    this.cancelarEdicion();
  } catch (error) {
    Utils.showMessage(error.message, 'error');
  }
}
```

### 3. Incluir el Módulo de API en HTML

Agregar en todos los HTML (después de config.js):

```html
<script src="js/config.js"></script>
<script src="js/api.js"></script>
<script src="js/pacientes.js"></script>
```

## 🔧 Testing

### 1. Probar con Postman

Antes de integrar con frontend, probar los endpoints:

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

Deberías recibir un token.

### 2. Probar Frontend

1. Abrir `login.html` en el navegador
2. Ingresar: admin / 123456
3. Si todo funciona, serás redirigido al dashboard

## 🐛 Problemas Comunes

### CORS Error
```
Access to fetch at 'http://localhost:3000' has been blocked by CORS
```

**Solución:** Verificar que CORS_ORIGIN en `.env` incluya tu URL del frontend.

### Network Error
```
TypeError: Failed to fetch
```

**Solución:** 
- Verificar que el backend esté corriendo
- Verificar la URL de la API en config.js

### 401 Unauthorized
```
Token inválido o expirado
```

**Solución:**
- Hacer login nuevamente
- Verificar que el token se esté guardando correctamente

## 📊 Flujo de Datos

```
Frontend (HTML/JS)
    ↓
api.js (fetch)
    ↓
Backend API (Express)
    ↓
Controller
    ↓
Service (lógica de negocio)
    ↓
Storage (archivos JSON)
```

## 🎯 Checklist de Integración

- [ ] Backend corriendo en puerto 3000
- [ ] CORS configurado correctamente
- [ ] API module creado (api.js)
- [ ] Login actualizado para usar API
- [ ] Pacientes actualizado para usar API
- [ ] Médicos actualizado para usar API
- [ ] Citas actualizado para usar API
- [ ] Testing de login funcionando
- [ ] Testing de CRUD funcionando

## 🚀 Siguiente Paso

Una vez que la integración funcione:
- Migrar a PostgreSQL
- Desplegar en producción
- Agregar más características

---

**¿Necesitas ayuda con la integración?** Revisa los logs del navegador (F12) y del servidor.
