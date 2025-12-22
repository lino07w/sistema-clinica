# Backend - Sistema de Gestión de Clínica

API RESTful profesional desarrollada con Node.js y Express para el sistema de gestión de clínica.

## 🚀 Características

### ✅ Arquitectura Profesional
- **ES6 Modules** - Código moderno con import/export
- **Arquitectura MVC** - Separación de responsabilidades
- **Servicios** - Lógica de negocio centralizada
- **Middleware** - Autenticación, validación, errores

### 🔐 Seguridad
- **JWT** - Autenticación con JSON Web Tokens
- **bcryptjs** - Hash de contraseñas
- **Helmet** - Protección de headers HTTP
- **CORS** - Control de acceso entre dominios
- **Rate Limiting** - Protección contra ataques

### ✔️ Validación
- **express-validator** - Validación robusta de datos
- **Validaciones personalizadas** - DNI, email, teléfono, fechas

### 📊 Almacenamiento
- **Archivos JSON** - Almacenamiento temporal sin BD
- **Fácil migración** - Preparado para PostgreSQL

## 📁 Estructura del Proyecto

\`\`\`
clinica-backend/
├── config/
│   └── config.js          # Configuración y variables de entorno
├── middleware/
│   ├── auth.js            # Middleware de autenticación JWT
│   ├── errorHandler.js    # Manejo centralizado de errores
│   └── validators.js      # Validaciones con express-validator
├── routes/
│   ├── authRoutes.js      # Rutas de autenticación
│   └── entityRoutes.js    # Rutas de pacientes, médicos, citas
├── controllers/
│   ├── authController.js  # Controlador de autenticación
│   ├── pacienteController.js
│   ├── medicoController.js
│   └── citaController.js
├── services/
│   ├── authService.js     # Lógica de negocio de auth
│   ├── pacienteService.js
│   ├── medicoService.js
│   └── citaService.js
├── utils/
│   ├── fileStorage.js     # Manejo de archivos JSON
│   ├── jwt.js             # Utilidades JWT
│   └── response.js        # Respuestas estandarizadas
├── data/                  # Almacenamiento JSON (gitignored)
├── server.js              # Punto de entrada
├── package.json
├── .env                   # Variables de entorno (gitignored)
└── .env.example           # Template de variables
\`\`\`

## 🛠️ Instalación

### 1. Instalar Dependencias
\`\`\`bash
npm install
\`\`\`

### 2. Configurar Variables de Entorno
Copiar \`.env.example\` a \`.env\` y ajustar valores:

\`\`\`bash
cp .env.example .env
\`\`\`

Editar \`.env\`:
\`\`\`env
PORT=3000
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5500
\`\`\`

### 3. Iniciar Servidor

**Desarrollo:**
\`\`\`bash
npm run dev
\`\`\`

**Producción:**
\`\`\`bash
npm start
\`\`\`

El servidor se iniciará en: \`http://localhost:3000\`

## 📚 API Endpoints

### Autenticación

#### Login
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}

Response:
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "admin",
      "username": "admin",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
\`\`\`

#### Obtener Usuario Actual
\`\`\`http
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Usuario obtenido correctamente",
  "data": {
    "id": "admin",
    "username": "admin",
    "role": "admin"
  }
}
\`\`\`

### Pacientes

#### Obtener Todos
\`\`\`http
GET /api/pacientes
Authorization: Bearer <token>
\`\`\`

#### Crear Paciente
\`\`\`http
POST /api/pacientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "fechaNacimiento": "1990-01-15",
  "telefono": "987654321",
  "email": "juan@email.com",
  "direccion": "Av. Principal 123"
}
\`\`\`

#### Actualizar Paciente
\`\`\`http
PUT /api/pacientes/:id
Authorization: Bearer <token>
\`\`\`

#### Eliminar Paciente
\`\`\`http
DELETE /api/pacientes/:id
Authorization: Bearer <token>
\`\`\`

#### Buscar Pacientes
\`\`\`http
GET /api/pacientes/search?q=juan
Authorization: Bearer <token>
\`\`\`

### Médicos

Similar a pacientes con endpoints:
- \`GET /api/medicos\`
- \`POST /api/medicos\`
- \`PUT /api/medicos/:id\`
- \`DELETE /api/medicos/:id\`
- \`GET /api/medicos/search?q=...\`
- \`GET /api/medicos/especialidad/:especialidad\`

### Citas

Similar con endpoints adicionales:
- \`GET /api/citas\`
- \`POST /api/citas\`
- \`PUT /api/citas/:id\`
- \`DELETE /api/citas/:id\`
- \`GET /api/citas/paciente/:pacienteId\`
- \`GET /api/citas/medico/:medicoId\`
- \`GET /api/citas/fecha/:fecha\`
- \`GET /api/citas/stats\`

## 🔑 Autenticación

Todas las rutas (excepto login) requieren autenticación JWT.

**Agregar token en headers:**
\`\`\`
Authorization: Bearer <tu_token_jwt>
\`\`\`

## ⚙️ Configuración CORS

Para conectar con el frontend, agregar la URL del frontend en \`.env\`:

\`\`\`env
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
\`\`\`

## 🧪 Testing con Postman

1. Importar la colección (próximamente)
2. Hacer login para obtener token
3. Usar el token en las demás peticiones

## 🔄 Migración a PostgreSQL

Cuando estés listo para migrar:

1. Instalar Sequelize o Prisma
2. Modificar servicios para usar ORM
3. Los controladores NO necesitan cambios
4. Actualizar config para conexión a BD

## 📦 Scripts Disponibles

\`\`\`bash
npm start       # Iniciar servidor producción
npm run dev     # Iniciar con nodemon (desarrollo)
\`\`\`

## 🐛 Solución de Problemas

### Error: "Cannot find module"
- Verificar que \`"type": "module"\` esté en package.json
- Usar \`.js\` en todos los imports

### Error: CORS
- Verificar CORS_ORIGIN en .env
- Asegurar que el frontend use la URL correcta

### Error: JWT Token inválido
- Verificar que JWT_SECRET sea el mismo
- Verificar formato: "Bearer token"

## 🚀 Próximos Pasos

- [ ] Agregar tests (Jest)
- [ ] Documentación Swagger
- [ ] Migrar a PostgreSQL
- [ ] Agregar roles y permisos
- [ ] Implementar refresh tokens
- [ ] Agregar logs estructurados

## 📄 Licencia

MIT

---

**¡Backend listo para conectar con el frontend!** 🎉
## Nota de configuraci�n de base de datos

Ejemplo de variable para entorno local (sin Docker):
DATABASE_URL=postgres://postgres:change_me@localhost:5432/clinica

Si levantas con Docker Compose (desde la ra�z del monorepo), usa:
DATABASE_URL=postgres://postgres:change_me@db:5432/clinica

