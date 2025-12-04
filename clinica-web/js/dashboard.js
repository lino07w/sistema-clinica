/**
 * Dashboard - Página principal
 */

// Verificar autenticación
if (!API.TokenManager.getToken()) {
  window.location.href = 'login.html';
}

// Obtener información del usuario
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userNameElement = document.getElementById('userName');
if (userNameElement && user.username) {
  userNameElement.textContent = user.username;
}

// Cerrar sesión
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      API.Auth.logout();
    }
  });
}

// Cargar estadísticas del dashboard
async function cargarEstadisticas() {
  try {
    const [pacientes, medicos, citas] = await Promise.all([
      API.Pacientes.getAll(),
      API.Medicos.getAll(),
      API.Citas.getAll()
    ]);

    // Actualizar contadores
    const totalPacientes = document.getElementById('totalPacientes');
    const totalMedicos = document.getElementById('totalMedicos');
    const totalCitas = document.getElementById('totalCitas');
    const citasPendientes = document.getElementById('citasPendientes');

    if (totalPacientes) totalPacientes.textContent = pacientes.data.length;
    if (totalMedicos) totalMedicos.textContent = medicos.data.length;
    if (totalCitas) totalCitas.textContent = citas.data.length;
    
    const pendientes = citas.data.filter(c => c.estado === 'programada').length;
    if (citasPendientes) citasPendientes.textContent = pendientes;

  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

// Cargar al inicio
document.addEventListener('DOMContentLoaded', cargarEstadisticas);