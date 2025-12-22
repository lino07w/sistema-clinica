import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas protegidas
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Medicos from './pages/Medicos';
import Citas from './pages/Citas';
import Usuarios from './pages/Usuarios';
import Solicitudes from './pages/Solicitudes';
import Reportes from './pages/Reportes';
import Facturacion from './pages/Facturacion';
import Configuracion from './pages/Configuracion';
import HistorialMedico from './pages/HistorialMedico';
import Auditoria from './pages/Auditoria';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
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

            {/* 🆕 NUEVA RUTA - Reportes (Solo Admin) */}
            <Route
              path="/reportes"
              element={
                <ProtectedRoute allowedRoles={['administrador']}>
                  <Reportes />
                </ProtectedRoute>
              }
            />

            {/* 🆕 NUEVA RUTA - Historial Médico (Admin y Médico) */}
            <Route
              path="/historial"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'medico']}>
                  <HistorialMedico />
                </ProtectedRoute>
              }
            />

            {/* 🆕 NUEVA RUTA - Configuración (Solo Admin) */}
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

            {/* 🆕 NUEVA RUTA - Facturación (Admin y Recepcionista) */}
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
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;