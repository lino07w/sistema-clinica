/**
 * Gestión de Médicos
 */

// Verificar autenticación
if (!API.TokenManager.getToken()) {
  window.location.href = 'login.html';
}

let medicos = [];
let medicoEditando = null;

// Cargar médicos al inicio
document.addEventListener('DOMContentLoaded', cargarMedicos);

async function cargarMedicos() {
  try {
    const response = await API.Medicos.getAll();
    medicos = response.data || [];
    mostrarMedicos();
  } catch (error) {
    console.error('Error cargando médicos:', error);
    alert('Error al cargar médicos');
  }
}

function mostrarMedicos() {
  const tbody = document.getElementById('listaMedicos');
  if (!tbody) return;

  if (medicos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay médicos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = medicos.map(medico => `
    <tr>
      <td>${medico.nombre}</td>
      <td>${medico.especialidad}</td>
      <td>${medico.matricula}</td>
      <td>${medico.dni}</td>
      <td>${medico.telefono}</td>
      <td>${medico.email}</td>
      <td>
        <button onclick="editarMedico('${medico.id}')" class="btn btn-sm btn-secondary">Editar</button>
        <button onclick="eliminarMedico('${medico.id}')" class="btn btn-sm btn-danger">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// Mostrar formulario
const btnNuevoMedico = document.getElementById('btnNuevoMedico');
if (btnNuevoMedico) {
  btnNuevoMedico.addEventListener('click', () => {
    medicoEditando = null;
    document.getElementById('formTitle').textContent = 'Nuevo Médico';
    document.getElementById('medicoForm').reset();
    document.getElementById('modalMedico').style.display = 'flex';
  });
}

// Cerrar modal
const btnCancelar = document.getElementById('btnCancelar');
if (btnCancelar) {
  btnCancelar.addEventListener('click', () => {
    document.getElementById('modalMedico').style.display = 'none';
  });
}

// Guardar médico
const medicoForm = document.getElementById('medicoForm');
if (medicoForm) {
  medicoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
      nombre: document.getElementById('nombre').value.trim(),
      especialidad: document.getElementById('especialidad').value.trim(),
      matricula: document.getElementById('matricula').value.trim(),
      dni: document.getElementById('dni').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      email: document.getElementById('email').value.trim()
    };

    try {
      if (medicoEditando) {
        await API.Medicos.update(medicoEditando, datos);
        alert('Médico actualizado correctamente');
      } else {
        await API.Medicos.create(datos);
        alert('Médico creado correctamente');
      }

      document.getElementById('modalMedico').style.display = 'none';
      await cargarMedicos();
    } catch (error) {
      console.error('Error guardando médico:', error);
      alert(error.message || 'Error al guardar médico');
    }
  });
}

async function editarMedico(id) {
  try {
    const response = await API.Medicos.getById(id);
    const medico = response.data;

    medicoEditando = id;
    document.getElementById('formTitle').textContent = 'Editar Médico';
    document.getElementById('nombre').value = medico.nombre;
    document.getElementById('especialidad').value = medico.especialidad;
    document.getElementById('matricula').value = medico.matricula;
    document.getElementById('dni').value = medico.dni;
    document.getElementById('telefono').value = medico.telefono;
    document.getElementById('email').value = medico.email;
    document.getElementById('modalMedico').style.display = 'flex';
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar médico');
  }
}

async function eliminarMedico(id) {
  if (!confirm('¿Está seguro de eliminar este médico?')) return;

  try {
    await API.Medicos.delete(id);
    alert('Médico eliminado correctamente');
    await cargarMedicos();
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Error al eliminar médico');
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