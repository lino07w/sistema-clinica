import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Medicos from './pages/Medicos'
import Citas from './pages/Citas'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/pacientes" 
        element={
          <ProtectedRoute>
            <Pacientes />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/medicos" 
        element={
          <ProtectedRoute>
            <Medicos />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/citas" 
        element={
          <ProtectedRoute>
            <Citas />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App