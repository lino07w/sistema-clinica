# 🚀 INSTALACIÓN Y USO RÁPIDO - Backend Node.js

## ✅ Lo que tienes ahora

Has recibido un **backend profesional** con:
- ✅ Node.js + Express
- ✅ ES6 Modules
- ✅ Arquitectura MVC (Rutas, Controladores, Servicios)
- ✅ JWT Authentication
- ✅ Express-validator
- ✅ Manejo centralizado de errores
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Helmet (seguridad)
- ✅ Sin base de datos (usa JSON temporalmente)

## 📦 Paso 1: Instalar Node.js

Si no tienes Node.js instalado:

### Windows / Mac:
1. Ir a https://nodejs.org
2. Descargar la versión LTS
3. Instalar

### Linux:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verificar instalación:**
```bash
node --version    # Debería mostrar v18.x o superior
npm --version     # Debería mostrar 9.x o superior
```

## 📁 Paso 2: Preparar el Proyecto

```bash
# 1. Descomprime los archivos
unzip clinica-backend.zip
cd clinica-backend

# 2. Instalar dependencias (esto puede tomar 1-2 minutos)
npm install
```

## ⚙️ Paso 3: Configurar Variables

El archivo `.env` ya está configurado, pero si necesitas cambiar algo:

```env
PORT=3000                    # Puerto del servidor
JWT_SECRET=tu_clave_secreta  # Cambiar en producción
CORS_ORIGIN=http://localhost:5500  # URL de tu frontend
```

## 🎯 Paso 4: Iniciar el Servidor

### Opción A: Modo Desarrollo (recomendado)
```bash
npm run dev
```

### Opción B: Modo Producción
```bash
npm start
```

Deberías ver:
```
✅ Servidor corriendo en puerto 3000
🌍 Entorno: development
🔗 URL: http://localhost:3000
```

## 🧪 Paso 5: Probar que Funciona

### Opción 1: Navegador
Abre: http://localhost:3000

Deberías ver:
```json
{
  "success": true,
  "message": "API de Sistema de Gestión de Clínica",
  "version": "1.0.0"
}
```

### Opción 2: Comando curl (Terminal)
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

## 🔗 Paso 6: Conectar con Frontend

### A. Abrir Frontend

Si tienes el frontend HTML/CSS/JS:

1. Abrir con Live Server (VSCode) o cualquier servidor HTTP local
2. URL típica: `http://localhost:5500` o `http://127.0.0.1:5500`

### B. Verificar CORS

En `.env` del backend, asegurar que `CORS_ORIGIN` incluye tu URL del frontend:

```env
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

Si cambias esto, **reiniciar el servidor**.

## 📝 Credenciales por Defecto

```
Usuario: admin
Contraseña: 123456
```

## 🎯 Endpoints Disponibles

### Autenticación
```http
POST /api/auth/login
```

### Pacientes
```http
GET    /api/pacientes
POST   /api/pacientes
PUT    /api/pacientes/:id
DELETE /api/pacientes/:id
```

### Médicos
```http
GET    /api/medicos
POST   /api/medicos
PUT    /api/medicos/:id
DELETE /api/medicos/:id
```

### Citas
```http
GET    /api/citas
POST   /api/citas
PUT    /api/citas/:id
DELETE /api/citas/:id
```

## 🛠️ Comandos Útiles

```bash
# Ver logs en tiempo real
npm run dev

# Detener el servidor
Ctrl + C

# Ver archivos de datos (JSON)
ls -la data/

# Ver contenido de pacientes
cat data/pacientes.json
```

## 📊 Estructura de Datos (JSON)

Los datos se guardan en:
```
data/
├── pacientes.json
├── medicos.json
├── citas.json
└── usuarios.json
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en .env
PORT=3001
```

### Error: CORS
```bash
# Verificar que CORS_ORIGIN en .env tenga la URL correcta
# Reiniciar servidor después de cambiar
```

### Error al instalar dependencias
```bash
# Limpiar caché de npm
npm cache clean --force
npm install
```

## 📈 Próximos Pasos

Una vez que todo funcione:

1. ✅ **Probar todos los endpoints** con Postman
2. ✅ **Conectar el frontend** (ver INTEGRACION.md)
3. ✅ **Agregar más pacientes/médicos** de prueba
4. ⏭️ **Migrar a PostgreSQL** cuando estés listo
5. ⏭️ **Desplegar en producción**

## 🎓 Aprendizaje

Este backend usa:
- **Express**: Framework web
- **JWT**: Autenticación segura
- **express-validator**: Validación de datos
- **bcryptjs**: Hash de contraseñas
- **helmet**: Seguridad HTTP
- **cors**: Compartir recursos entre orígenes
- **morgan**: Logger de peticiones

## 💰 Para Venta

Este backend te permite:
- ✅ Vender a clientes pequeños ($1,500+)
- ✅ Soportar múltiples usuarios
- ✅ Datos centralizados
- ✅ Seguridad profesional
- ✅ Fácil migración a PostgreSQL

## 📞 Soporte

Si tienes problemas:

1. Revisar logs del servidor en la terminal
2. Revisar archivo README.md
3. Revisar archivo INTEGRACION.md para conectar frontend

## ✨ Características Implementadas

- [x] Autenticación JWT
- [x] CRUD Pacientes
- [x] CRUD Médicos  
- [x] CRUD Citas
- [x] Validaciones robustas
- [x] Manejo de errores
- [x] Seguridad HTTP
- [x] Rate limiting
- [x] CORS configurado

---

**🎉 ¡Tu backend está listo para usarse!**

Siguiente archivo a revisar: `INTEGRACION.md` para conectar con el frontend.
