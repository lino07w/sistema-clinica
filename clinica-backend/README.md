# Backend · Sistema de Gestión de Clínica

API REST con **Express 5 + Sequelize + PostgreSQL**. Consulta el [README principal](../README.md) para la visión general y la arquitectura.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga automática (nodemon) |
| `npm start` | Servidor en modo producción |
| `npm run lint` | ESLint |
| `npm test` | Tests de integración (Jest + Supertest). Requiere PostgreSQL |
| `npm run db:init` | Crea/actualiza tablas y siembra la configuración y el administrador |
| `npm run seed` | **Borra la BD** y carga datos de demostración |

## Variables de entorno

Ver [`.env.example`](.env.example). Las más importantes:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `JWT_SECRET` | Sí, en producción | Secreto para firmar los JWT |
| `DATABASE_URL` o `DB_*` | Sí | Conexión a PostgreSQL |
| `FRONTEND_URL` | Sí, en producción | Origen permitido por CORS y base de los enlaces en emails |
| `DEFAULT_ADMIN_PASSWORD` | Sí, en producción | Contraseña del administrador inicial |
| `DB_SSL` | No | `true` por defecto en producción |
| `SEED_DEMO_DATA` | No | Carga datos de demo si la BD está vacía |

## Endpoints principales

Documentación interactiva en `/api-docs` (Swagger).

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/auth/login` | Público |
| `POST` | `/api/auth/register` | Público (queda pendiente de aprobación) |
| `POST` | `/api/auth/forgot-password` · `/reset-password/:token` | Público |
| `GET/POST/PUT/DELETE` | `/api/pacientes` | Personal (eliminar: admin) |
| `GET/POST/PUT/DELETE` | `/api/medicos` | Autenticado (escritura: admin) |
| `GET/POST/PUT/DELETE` | `/api/citas` | Filtrado por rol |
| `GET/POST/PUT/DELETE` | `/api/historial` | Admin y médico |
| `GET/POST/PUT/DELETE` | `/api/facturas` | Admin y recepcionista |
| `GET/POST/PUT/DELETE/PATCH` | `/api/usuarios` | Admin |
| `GET` | `/api/auditoria` | Admin |
| `GET` | `/api/health` | Público |

Formato de respuesta uniforme:

```json
{ "success": true, "message": "…", "data": { } }
{ "success": false, "message": "…", "errors": [ ] }
```
