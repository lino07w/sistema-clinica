/**
 * Datos de demostración reutilizables (script `npm run seed` y bootstrap
 * con SEED_DEMO_DATA=true).
 *
 * Credenciales creadas:
 *   admin / DEFAULT_ADMIN_PASSWORD   (administrador)
 *   c.mendoza / password123          (médico)
 *   recepcion / password123          (recepcionista)
 */

import config from '../config/config.js';
import db from '../models/index.js';

const { sequelize, User, Paciente, Medico, Cita, Factura, HistorialMedico, Config } = db;

export const DEMO_PASSWORD = 'password123';

const MEDICOS = [
  { nombre: 'Dr. Carlos Mendoza', especialidad: 'Cardiología', matricula: 'CMP-45678', email: 'c.mendoza@clinica.com', telefono: '987111222' },
  { nombre: 'Dra. Ana Torres', especialidad: 'Pediatría', matricula: 'CMP-51234', email: 'a.torres@clinica.com', telefono: '987333444' },
  { nombre: 'Dr. Roberto Luna', especialidad: 'Dermatología', matricula: 'CMP-39876', email: 'r.luna@clinica.com', telefono: '987555666' },
  { nombre: 'Dra. María Jara', especialidad: 'Ginecología', matricula: 'CMP-62345', email: 'm.jara@clinica.com', telefono: '987777888' },
  { nombre: 'Dr. Sergio Ramos', especialidad: 'Traumatología', matricula: 'CMP-41256', email: 's.ramos@clinica.com', telefono: '987999000' }
];

const PACIENTES = [
  { nombre: 'Juan Pérez', dni: '12345678', fechaNacimiento: '1985-03-12', genero: 'Masculino', telefono: '987654321', email: 'juan.perez@email.com', direccion: 'Calle Las Flores 123', grupoSanguineo: 'O+' },
  { nombre: 'Lucía Méndez', dni: '87654321', fechaNacimiento: '1992-07-25', genero: 'Femenino', telefono: '912345678', email: 'lucia.m@email.com', direccion: 'Av. Los Incas 456', grupoSanguineo: 'A+' },
  { nombre: 'Ricardo Salinas', dni: '45678123', fechaNacimiento: '1978-11-02', genero: 'Masculino', telefono: '955443322', email: 'salinas.r@email.com', direccion: 'Jr. Miraflores 789', grupoSanguineo: 'B+' },
  { nombre: 'Elena Guerra', dni: '11223344', fechaNacimiento: '2001-01-17', genero: 'Femenino', telefono: '944332211', email: 'elena.g@email.com', direccion: 'Urb. La Luz B-12', grupoSanguineo: 'AB-' },
  { nombre: 'Marcos Ruiz', dni: '55667788', fechaNacimiento: '1969-09-30', genero: 'Masculino', telefono: '966778899', email: 'mruiz@email.com', direccion: 'Calle Comercio 555', grupoSanguineo: 'O-' },
  { nombre: 'Sofía Castro', dni: '99887766', fechaNacimiento: '2015-05-08', genero: 'Femenino', telefono: '933221100', email: 'sofia.c@email.com', direccion: 'Av. Arequipa 1020', grupoSanguineo: 'A-' }
];

const MOTIVOS = ['Consulta general', 'Control de tratamiento', 'Chequeo anual', 'Dolor persistente', 'Resultados de laboratorio'];
const DIAS = [-20, -14, -10, -7, -5, -3, -2, -1, 0, 0, 1, 2, 3, 5, 7, 10, 14, 21];

const isoDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const estadoCita = (offset, index) => {
  if (offset < 0) return index % 6 === 0 ? 'cancelada' : 'completada';
  return 'programada';
};

/**
 * Inserta los datos de demostración.
 * @param {object}  [options]
 * @param {boolean} [options.reset=false] Borra y recrea todas las tablas antes.
 * @param {(msg: string) => void} [options.log]
 */
export const seedDemoData = async ({ reset = false, log = () => {} } = {}) => {
  if (reset) {
    await sequelize.sync({ force: true });
    log('✅ Base de datos reseteada');
  }

  await Config.destroy({ where: {} });
  await Config.create({
    nombreClinica: 'Centro Médico San José',
    horarioAtencion: 'Lunes a Viernes 08:00 - 20:00, Sábados 08:00 - 14:00',
    moneda: 'S/',
    direccion: 'Av. Las Palmeras 123, Lima',
    telefono: '01 444-5555'
  });

  // Usuarios del personal (las contraseñas se hashean en el hook del modelo).
  // El administrador puede existir ya (creado por bootstrap).
  const adminExists = await User.findOne({ where: { rol: 'administrador' } });
  if (!adminExists) {
    await User.create({
      username: config.defaultAdmin.username,
      email: config.defaultAdmin.email,
      password: config.defaultAdmin.password || '123456',
      nombre: 'Administrador Demo',
      rol: 'administrador',
      estado: 'activo'
    });
  }
  await User.create({
    username: 'recepcion',
    email: 'recepcion@clinica.com',
    password: DEMO_PASSWORD,
    nombre: 'Rosa Quispe',
    rol: 'recepcionista',
    estado: 'activo'
  });
  // Una solicitud pendiente para mostrar el flujo de aprobación
  await User.create({
    email: 'nuevo.medico@clinica.com',
    password: DEMO_PASSWORD,
    nombre: 'Dr. Luis Paredes',
    rol: 'medico',
    especialidad: 'Neurología',
    matricula: 'CMP-70001',
    estado: 'pendiente'
  });

  const medicos = [];
  for (const data of MEDICOS) {
    const medico = await Medico.create(data);
    medicos.push(medico);
    await User.create({
      username: data.email.split('@')[0],
      email: data.email,
      password: DEMO_PASSWORD,
      nombre: data.nombre,
      rol: 'medico',
      estado: 'activo',
      especialidad: data.especialidad,
      matricula: data.matricula,
      medicoId: medico.id
    });
  }
  log(`✅ ${medicos.length} médicos creados`);

  const pacientes = [];
  for (const data of PACIENTES) {
    pacientes.push(await Paciente.create(data));
  }
  log(`✅ ${pacientes.length} pacientes creados`);

  // Citas deterministas (sin aleatoriedad): reproducibles en cada ejecución
  for (const [i, offset] of DIAS.entries()) {
    const paciente = pacientes[i % pacientes.length];
    const medico = medicos[i % medicos.length];
    const fecha = isoDate(offset);
    const estado = estadoCita(offset, i);

    await Cita.create({
      pacienteId: paciente.id,
      medicoId: medico.id,
      fecha,
      hora: `${String(8 + (i % 9)).padStart(2, '0')}:00`,
      motivo: MOTIVOS[i % MOTIVOS.length],
      estado
    });

    if (estado === 'completada') {
      await HistorialMedico.create({
        pacienteId: paciente.id,
        medicoId: medico.id,
        fecha,
        diagnostico: 'Paciente presenta mejoría notable en los síntomas.',
        tratamiento: 'Continuar medicación por 2 semanas más.',
        notas: 'Recomendación de reposo moderado.'
      });

      await Factura.create({
        pacienteId: paciente.id,
        pacienteNombre: paciente.nombre,
        concepto: `Consulta de ${medico.especialidad}`,
        monto: 120 + (i % 4) * 30,
        fecha,
        estado: i % 3 === 0 ? 'pendiente' : 'pagada'
      });
    }
  }
  log(`✅ ${DIAS.length} citas con historial y facturas generadas`);
};

