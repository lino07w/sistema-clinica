/**
 * Gestión de Pacientes
 */

// Verificar autenticación
if (!API.TokenManager.getToken()) {
  window.location.href = 'login.html';
}

let pacientes = [];
let pacienteEditando = null;

// Cargar pacientes al inicio
document.addEventListener('DOMContentLoaded', cargarPacientes);

async function cargarPacientes() {
  try {
    const response = await API.Pacientes.getAll();
    pacientes = response.data || [];
    mostrarPacientes();
  } catch (error) {
    console.error('Error cargando pacientes:', error);
    alert('Error al cargar pacientes');
  }
}

function mostrarPacientes() {
  const tbody = document.getElementById('listaPacientes');
  if (!tbody) return;

  if (pacientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay pacientes registrados</td></tr>';
    return;
  }

  tbody.innerHTML = pacientes.map(paciente => `
    <tr>
      <td>${paciente.nombre}</td>
      <td>${paciente.dni}</td>
      <td>${paciente.fechaNacimiento}</td>
      <td>${paciente.telefono}</td>
      <td>${paciente.email}</td>
      <td>${paciente.direccion || '-'}</td>
      <td>
        <button onclick="editarPaciente('${paciente.id}')" class="btn btn-sm btn-secondary">Editar</button>
        <button onclick="eliminarPaciente('${paciente.id}')" class="btn btn-sm btn-danger">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// Mostrar formulario
const btnNuevoPaciente = document.getElementById('btnNuevoPaciente');
if (btnNuevoPaciente) {
  btnNuevoPaciente.addEventListener('click', () => {
    pacienteEditando = null;
    document.getElementById('formTitle').textContent = 'Nuevo Paciente';
    document.getElementById('pacienteForm').reset();
    document.getElementById('modalPaciente').style.display = 'flex';
  });
}

// Cerrar modal
const btnCancelar = document.getElementById('btnCancelar');
if (btnCancelar) {
  btnCancelar.addEventListener('click', () => {
    document.getElementById('modalPaciente').style.display = 'none';
  });
}

// Guardar paciente
const pacienteForm = document.getElementById('pacienteForm');
if (pacienteForm) {
  pacienteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
      nombre: document.getElementById('nombre').value.trim(),
      dni: document.getElementById('dni').value.trim(),
      fechaNacimiento: document.getElementById('fechaNacimiento').value,
      telefono: document.getElementById('telefono').value.trim(),
      email: document.getElementById('email').value.trim(),
      direccion: document.getElementById('direccion').value.trim()
    };

    try {
      if (pacienteEditando) {
        await API.Pacientes.update(pacienteEditando, datos);
        alert('Paciente actualizado correctamente');
      } else {
        await API.Pacientes.create(datos);
        alert('Paciente creado correctamente');
      }

      document.getElementById('modalPaciente').style.display = 'none';
      await cargarPacientes();
    } catch (error) {
      console.error('Error guardando paciente:', error);
      alert(error.message || 'Error al guardar paciente');
    }
  });
}

async function editarPaciente(id) {
  try {
    const response = await API.Pacientes.getById(id);
    const paciente = response.data;

    pacienteEditando = id;
    document.getElementById('formTitle').textContent = 'Editar Paciente';
    document.getElementById('nombre').value = paciente.nombre;
    document.getElementById('dni').value = paciente.dni;
    document.getElementById('fechaNacimiento').value = paciente.fechaNacimiento;
    document.getElementById('telefono').value = paciente.telefono;
    document.getElementById('email').value = paciente.email;
    document.getElementById('direccion').value = paciente.direccion || '';
    document.getElementById('modalPaciente').style.display = 'flex';
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar paciente');
  }
}

async function eliminarPaciente(id) {
  if (!confirm('¿Está seguro de eliminar este paciente?')) return;

  try {
    await API.Pacientes.delete(id);
    alert('Paciente eliminado correctamente');
    await cargarPacientes();
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Error al eliminar paciente');
  }
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