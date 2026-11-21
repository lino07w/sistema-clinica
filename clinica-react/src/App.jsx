import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

// Páginas públicas: se cargan de inmediato (primera pantalla)
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas protegidas: code splitting, cada una en su propio chunk.
// Así el login no descarga gráficos, PDF ni Excel.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pacientes = lazy(() => import('./pages/Pacientes'));
const Medicos = lazy(() => import('./pages/Medicos'));
const Citas = lazy(() => import('./pages/Citas'));
const Usuarios = lazy(() => import('./pages/Usuarios'));
const Solicitudes = lazy(() => import('./pages/Solicitudes'));
const Reportes = lazy(() => import('./pages/Reportes'));
const Facturacion = lazy(() => import('./pages/Facturacion'));
const Configuracion = lazy(() => import('./pages/Configuracion'));
const HistorialMedico = lazy(() => import('./pages/HistorialMedico'));
const Auditoria = lazy(() => import('./pages/Auditoria'));

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rutas protegidas - Todos los roles autenticados */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Rutas protegidas - Solo Admin */}
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute allowedRoles={['administrador']}>
                    <Usuarios />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/solicitudes"
                element={
                  <ProtectedRoute allowedRoles={['administrador']}>
                    <Solicitudes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/medicos"
                element={
                  <ProtectedRoute allowedRoles={['administrador']}>
                    <Medicos />
                  </ProtectedRoute>
                }
              />

              {/* Reportes (Solo Admin) */}
              <Route
                path="/reportes"
                element={
                  <ProtectedRoute allowedRoles={['administrador']}>
                    <Reportes />
                  </ProtectedRoute>
                }
              />

              {/* Historial Médico (Admin y Médico) */}
              <Route
                path="/historial"
                element={
                  <ProtectedRoute allowedRoles={['administrador', 'medico']}>
                    <HistorialMedico />
                  </ProtectedRoute>
                }
              />

              {/* Configuración (Solo Admin) */}
              <Route
                path="/configuracion"
                element={
                  <ProtectedRoute allowedRoles={['administrador']}>
                    <Configuracion />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/auditoria"
                element={
                  <ProtectedRoute allowedRoles={['administrador']}>
                    <Auditoria />
                  </ProtectedRoute>
                }
              />

              {/* Facturación (Admin y Recepcionista) */}
              <Route
                path="/facturacion"
                element={
                  <ProtectedRoute allowedRoles={['administrador', 'recepcionista']}>
                    <Facturacion />
                  </ProtectedRoute>
                }
              />

              {/* Rutas protegidas - Admin y Recepcionista */}
              <Route
                path="/pacientes"
                element={
                  <ProtectedRoute allowedRoles={['administrador', 'recepcionista']}>
                    <Pacientes />
                  </ProtectedRoute>
                }
              />

              {/* Rutas protegidas - Admin, Recepcionista y Médico */}
              <Route
                path="/citas"
                element={
                  <ProtectedRoute allowedRoles={['administrador', 'recepcionista', 'medico']}>
                    <Citas />
                  </ProtectedRoute>
                }
              />

              {/* Redirecciones */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;