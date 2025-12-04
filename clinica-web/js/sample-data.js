/**
 * Script para Cargar Datos de Ejemplo
 * Ejecutar desde la consola del navegador: loadSampleData()
 */

function loadSampleData() {
  console.log('🔄 Cargando datos de ejemplo...');

  // Datos de ejemplo de pacientes
  const pacientesEjemplo = [
    {
      id: 'pac001',
      nombre: 'María González Pérez',
      dni: '12345678',
      telefono: '987654321',
      email: 'maria.gonzalez@email.com',
      direccion: 'Av. Principal 123, Lima',
      fechaNacimiento: '1985-03-15',
      fechaRegistro: new Date('2024-01-15').toISOString()
    },
    {
      id: 'pac002',
      nombre: 'Juan Carlos Rodríguez',
      dni: '87654321',
      telefono: '987123456',
      email: 'juan.rodriguez@email.com',
      direccion: 'Calle Los Olivos 456, Lima',
      fechaNacimiento: '1990-07-20',
      fechaRegistro: new Date('2024-02-10').toISOString()
    },
    {
      id: 'pac003',
      nombre: 'Ana María Torres',
      dni: '45678912',
      telefono: '987456789',
      email: 'ana.torres@email.com',
      direccion: 'Jr. San Martín 789, Lima',
      fechaNacimiento: '1988-11-30',
      fechaRegistro: new Date('2024-03-05').toISOString()
    },
    {
      id: 'pac004',
      nombre: 'Pedro Sánchez Vargas',
      dni: '78912345',
      telefono: '987789456',
      email: 'pedro.sanchez@email.com',
      direccion: 'Av. Universitaria 321, Lima',
      fechaNacimiento: '1975-05-10',
      fechaRegistro: new Date('2024-01-20').toISOString()
    },
    {
      id: 'pac005',
      nombre: 'Carmen López Díaz',
      dni: '32165498',
      telefono: '987321654',
      email: 'carmen.lopez@email.com',
      direccion: 'Calle Las Flores 654, Lima',
      fechaNacimiento: '1995-09-25',
      fechaRegistro: new Date('2024-02-15').toISOString()
    }
  ];

  // Datos de ejemplo de médicos
  const medicosEjemplo = [
    {
      id: 'med001',
      nombre: 'Dr. Carlos Mendoza',
      dni: '11223344',
      especialidad: 'Medicina General',
      matricula: 'MP-12345',
      telefono: '987111222',
      email: 'dr.mendoza@clinica.com',
      horario: 'Lunes a Viernes 9:00 - 17:00',
      fechaRegistro: new Date('2024-01-10').toISOString(),
      activo: true
    },
    {
      id: 'med002',
      nombre: 'Dra. Patricia Rojas',
      dni: '22334455',
      especialidad: 'Pediatría',
      matricula: 'MP-23456',
      telefono: '987222333',
      email: 'dra.rojas@clinica.com',
      horario: 'Lunes a Viernes 10:00 - 18:00',
      fechaRegistro: new Date('2024-01-12').toISOString(),
      activo: true
    },
    {
      id: 'med003',
      nombre: 'Dr. Roberto García',
      dni: '33445566',
      especialidad: 'Cardiología',
      matricula: 'MP-34567',
      telefono: '987333444',
      email: 'dr.garcia@clinica.com',
      horario: 'Martes a Sábado 8:00 - 16:00',
      fechaRegistro: new Date('2024-01-15').toISOString(),
      activo: true
    },
    {
      id: 'med004',
      nombre: 'Dra. Isabel Fernández',
      dni: '44556677',
      especialidad: 'Dermatología',
      matricula: 'MP-45678',
      telefono: '987444555',
      email: 'dra.fernandez@clinica.com',
      horario: 'Lunes a Jueves 11:00 - 19:00',
      fechaRegistro: new Date('2024-01-18').toISOString(),
      activo: true
    },
    {
      id: 'med005',
      nombre: 'Dr. Miguel Ángel Castro',
      dni: '55667788',
      especialidad: 'Traumatología',
      matricula: 'MP-56789',
      telefono: '987555666',
      email: 'dr.castro@clinica.com',
      horario: 'Lunes a Viernes 7:00 - 15:00',
      fechaRegistro: new Date('2024-01-20').toISOString(),
      activo: true
    }
  ];

  // Generar algunas fechas para las citas
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  const proximaSemana = new Date(hoy);
  proximaSemana.setDate(proximaSemana.getDate() + 7);
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  // Datos de ejemplo de citas
  const citasEjemplo = [
    {
      id: 'cita001',
      pacienteId: 'pac001',
      medicoId: 'med001',
      fecha: manana.toISOString().split('T')[0],
      hora: '09:00',
      motivo: 'Control general',
      estado: 'confirmada',
      observaciones: 'Paciente solicitó resultados de análisis',
      fechaCreacion: new Date('2024-11-25').toISOString()
    },
    {
      id: 'cita002',
      pacienteId: 'pac002',
      medicoId: 'med003',
      fecha: hoy.toISOString().split('T')[0],
      hora: '10:00',
      motivo: 'Dolor en el pecho',
      estado: 'en-atencion',
      observaciones: 'Requiere electrocardiograma',
      fechaCreacion: new Date('2024-11-20').toISOString()
    },
    {
      id: 'cita003',
      pacienteId: 'pac003',
      medicoId: 'med002',
      fecha: proximaSemana.toISOString().split('T')[0],
      hora: '11:00',
      motivo: 'Vacunación infantil',
      estado: 'programada',
      observaciones: 'Traer carnet de vacunación',
      fechaCreacion: new Date('2024-11-28').toISOString()
    },
    {
      id: 'cita004',
      pacienteId: 'pac004',
      medicoId: 'med005',
      fecha: ayer.toISOString().split('T')[0],
      hora: '08:00',
      motivo: 'Dolor en la rodilla',
      estado: 'completada',
      observaciones: 'Se solicitó radiografía',
      fechaCreacion: new Date('2024-11-15').toISOString()
    },
    {
      id: 'cita005',
      pacienteId: 'pac005',
      medicoId: 'med004',
      fecha: hoy.toISOString().split('T')[0],
      hora: '14:00',
      motivo: 'Consulta por acné',
      estado: 'confirmada',
      observaciones: 'Primera consulta',
      fechaCreacion: new Date('2024-11-22').toISOString()
    },
    {
      id: 'cita006',
      pacienteId: 'pac001',
      medicoId: 'med004',
      fecha: proximaSemana.toISOString().split('T')[0],
      hora: '15:00',
      motivo: 'Revisión de lunares',
      estado: 'programada',
      observaciones: '',
      fechaCreacion: new Date('2024-11-29').toISOString()
    },
    {
      id: 'cita007',
      pacienteId: 'pac003',
      medicoId: 'med001',
      fecha: manana.toISOString().split('T')[0],
      hora: '16:00',
      motivo: 'Control post-operatorio',
      estado: 'cancelada',
      observaciones: 'Paciente canceló por motivos personales',
      fechaCreacion: new Date('2024-11-26').toISOString()
    }
  ];

  // Guardar en localStorage
  try {
    localStorage.setItem('clinica_pacientes', JSON.stringify(pacientesEjemplo));
    localStorage.setItem('clinica_medicos', JSON.stringify(medicosEjemplo));
    localStorage.setItem('clinica_citas', JSON.stringify(citasEjemplo));
    
    console.log('✅ Datos de ejemplo cargados exitosamente:');
    console.log(`   - ${pacientesEjemplo.length} pacientes`);
    console.log(`   - ${medicosEjemplo.length} médicos`);
    console.log(`   - ${citasEjemplo.length} citas`);
    console.log('\n🔄 Recarga la página para ver los datos.');
    
    return true;
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    return false;
  }
}

function clearAllData() {
  if (confirm('¿Está seguro de eliminar todos los datos?')) {
    localStorage.removeItem('clinica_pacientes');
    localStorage.removeItem('clinica_medicos');
    localStorage.removeItem('clinica_citas');
    
    console.log('✅ Todos los datos han sido eliminados.');
    console.log('🔄 Recarga la página para ver los cambios.');
    
    return true;
  }
  return false;
}

// Instrucciones de uso
console.log(`
═══════════════════════════════════════════════════════
  SISTEMA DE GESTIÓN DE CLÍNICA - DATOS DE EJEMPLO
═══════════════════════════════════════════════════════

Para cargar datos de ejemplo, ejecuta en la consola:

  loadSampleData()

Para eliminar todos los datos:

  clearAllData()

═══════════════════════════════════════════════════════
`);

// Hacer las funciones globales
window.loadSampleData = loadSampleData;
window.clearAllData = clearAllData;
