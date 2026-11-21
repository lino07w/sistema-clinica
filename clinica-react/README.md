# Frontend · Sistema de Gestión de Clínica

SPA con **React 19 + Vite**. Consulta el [README principal](../README.md) para la visión general.

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run dev            # http://localhost:5173
npm run lint
npm run build
```

## Estructura

```
src/
├── pages/        # Una página por ruta (cargadas con React.lazy)
├── components/   # Componentes reutilizables (tablas, modales, exportación…)
├── context/      # Auth, tema y notificaciones
├── hooks/        # useTableData (búsqueda, orden y paginación)
├── schemas/      # Validación de formularios con Zod
├── services/     # Cliente HTTP (Axios) con interceptores de JWT
├── config/       # Registro de Chart.js
└── utils/        # Exportación a Excel/PDF y utilidades
```

`vercel.json` define el rewrite SPA (React Router), el cacheo inmutable de assets y cabeceras de seguridad.
