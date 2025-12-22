# Sistema de Gestión de Clínica

Monorepo con backend (Node.js/Express) y frontend (React/Vite) listo para despliegue por Docker o manual.

## Estructura
- clinica-backend
- clinica-react
- docker-compose.yml

## Requisitos
- Opción A: Docker Desktop
- Opción B: Node.js 18+ y npm

## Variables de entorno
1. Copiar `.env.example` en la raíz a `.env` y ajustar valores:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_DB=clinica
DATABASE_URL=postgres://postgres:change_me@db:5432/clinica
JWT_SECRET=please_change
NODE_ENV=production
PORT=3000
VITE_API_URL=http://localhost:3000
```
2. (Opcional) Backend/Frontend local:
- `clinica-backend/.env.example` -> `.env`
- `clinica-react/.env.example` -> `.env`

## Despliegue con Docker
```
# En la raíz del proyecto
cp .env.example .env
# Edita .env si es necesario

docker compose up -d --build
```
- Backend: http://localhost:3000
- Swagger: http://localhost:3000/api-docs
- Frontend: http://localhost

Para detener: `docker compose down`

## Ejecución manual (sin Docker)
### Backend
```
cd clinica-backend
cp .env.example .env
npm install
npm run dev  # o npm start
```
- API en http://localhost:3000

### Frontend
```
cd clinica-react
cp .env.example .env
npm install
npm run dev
```
- App en http://localhost:5173 (URL de Vite)

Asegúrate de que `VITE_API_URL` en `clinica-react/.env` apunte al backend (por defecto http://localhost:3000).

## Packaging para venta
- NO incluir: `node_modules`, archivos `.env`, datos sensibles.
- SÍ incluir: código fuente, `LICENSE`, `README.md`, `docker-compose.yml`, `Dockerfile(s)`, `.env.example` (raíz y proyectos), colección Postman si aplica.

## Licencia
MIT
