/**
 * Gestión de Citas
 */

// Verificar autenticación
if (!API.TokenManager.getToken()) {
  window.location.href = 'login.html';
}

let citas = [];
let pacientes = [];
let medicos = [];
let citaEditando = null;

// Cargar datos al inicio
document.addEventListener('DOMContentLoaded', async () => {
  await cargarDatos();
});

async function cargarDatos() {
  try {
    const [citasRes, pacientesRes, medicosRes] = await Promise.all([
      API.Citas.getAll(),
      API.Pacientes.getAll(),
      API.Medicos.getAll()
    ]);

    citas = citasRes.data || [];
    pacientes = pacientesRes.data || [];
    medicos = medicosRes.data || [];

    mostrarCitas();
    cargarSelectPacientes();
    cargarSelectMedicos();
  } catch (error) {
    console.error('Error cargando datos:', error);
    alert('Error al cargar datos');
  }
}

function mostrarCitas() {
  const tbody = document.getElementById('listaCitas');
  if (!tbody) return;

  if (citas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay citas registradas</td></tr>';
    return;
  }

  tbody.innerHTML = citas.map(cita => {
    const paciente = pacientes.find(p => p.id === cita.pacienteId);
    const medico = medicos.find(m => m.id === cita.medicoId);
    
    const estadoBadge = {
      'programada': 'badge-info',
      'completada': 'badge-success',
      'cancelada': 'badge-danger',
      'en_proceso': 'badge-warning'
    }[cita.estado] || 'badge-secondary';

    return `
      <tr>
        <td>${paciente ? paciente.nombre : 'Desconocido'}</td>
        <td>${medico ? medico.nombre : 'Desconocido'}</td>
        <td>${cita.fecha}</td>
        <td>${cita.hora}</td>
        <td>${cita.motivo || '-'}</td>
        <td><span class="badge ${estadoBadge}">${cita.estado}</span></td>
        <td>
          <button onclick="editarCita('${cita.id}')" class="btn btn-sm btn-secondary">Editar</button>
          <button onclick="eliminarCita('${cita.id}')" class="btn btn-sm btn-danger">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

function cargarSelectPacientes() {
  const select = document.getElementById('pacienteId');
  if (!select) return;

  select.innerHTML = '<option value="">Seleccione un paciente</option>' +
    pacientes.map(p => `<option value="${p.id}">${p.nombre} - ${p.dni}</option>`).join('');
}

function cargarSelectMedicos() {
  const select = document.getElementById('medicoId');
  if (!select) return;

  select.innerHTML = '<option value="">Seleccione un médico</option>' +
    medicos.map(m => `<option value="${m.id}">${m.nombre} - ${m.especialidad}</option>`).join('');
}

// Mostrar formulario
const btnNuevaCita = document.getElementById('btnNuevaCita');
if (btnNuevaCita) {
  btnNuevaCita.addEventListener('click', () => {
    citaEditando = null;
    document.getElementById('formTitle').textContent = 'Nueva Cita';
    document.getElementById('citaForm').reset();
    document.getElementById('modalCita').style.display = 'flex';
  });
}

// Cerrar modal
const btnCancelar = document.getElementById('btnCancelar');
if (btnCancelar) {
  btnCancelar.addEventListener('click', () => {
    document.getElementById('modalCita').style.display = 'none';
  });
}

// Guardar cita
const citaForm = document.getElementById('citaForm');
if (citaForm) {
  citaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
      pacienteId: document.getElementById('pacienteId').value,
      medicoId: document.getElementById('medicoId').value,
      fecha: document.getElementById('fecha').value,
      hora: document.getElementById('hora').value,
      motivo: document.getElementById('motivo').value.trim(),
      estado: document.getElementById('estado').value
    };

    if (!datos.pacienteId || !datos.medicoId) {
      alert('Debe seleccionar un paciente y un médico');
      return;
    }

    try {
      if (citaEditando) {
        await API.Citas.update(citaEditando, datos);
        alert('Cita actualizada correctamente');
      } else {
        await API.Citas.create(datos);
        alert('Cita creada correctamente');
      }

      document.getElementById('modalCita').style.display = 'none';
      await cargarDatos();
    } catch (error) {
      console.error('Error guardando cita:', error);
      alert(error.message || 'Error al guardar cita');
    }
  });
}

async function editarCita(id) {
  try {
    const response = await API.Citas.getById(id);
    const cita = response.data;

    citaEditando = id;
    document.getElementById('formTitle').textContent = 'Editar Cita';
    document.getElementById('pacienteId').value = cita.pacienteId;
    document.getElementById('medicoId').value = cita.medicoId;
    document.getElementById('fecha').value = cita.fecha;
    document.getElementById('hora').value = cita.hora;
    document.getElementById('motivo').value = cita.motivo || '';
    document.getElementById('estado').value = cita.estado;
    document.getElementById('modalCita').style.display = 'flex';
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar cita');
  }
}

async function eliminarCita(id) {
  if (!confirm('¿Está seguro de eliminar esta cita?')) return;

  try {
    await API.Citas.delete(id);
    alert('Cita eliminada correctamente');
    await cargarDatos();
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Error al eliminar cita');
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