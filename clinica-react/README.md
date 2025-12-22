# React + Vite

Frontend – Clínica (React + Vite)

Aplicación frontend para el Sistema de Gestión de Clínica. Construida con React y Vite.

Requisitos
- Node.js 18+
- npm

Instalación
```
npm install
```

Variables de entorno
1. Copiar `.env.example` → `.env` y ajustar:
```
VITE_API_URL=http://localhost:3000
```
2. Asegúrate que `VITE_API_URL` apunte al backend.

Scripts
- npm run dev → Desarrollo (Vite) en http://localhost:5173
- npm run build → Compilación de producción
- npm run preview → Previsualización del build en http://localhost:4173

Despliegue con Docker (monorepo)
Este frontend se construye y sirve desde `docker-compose.yml` en la raíz. Asegúrate de crear `.env` en la raíz (ver README raíz) y ejecuta:
```
docker compose up -d --build
```

Licencia
MIT
