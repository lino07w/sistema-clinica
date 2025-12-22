import sequelize from '../config/database.js';
import User from './User.js';
import Paciente from './Paciente.js';
import Medico from './Medico.js';
import Cita from './Cita.js';
import Factura from './Factura.js';
import HistorialMedico from './HistorialMedico.js';
import Config from './Config.js';
import AuditLog from './AuditLog.js';

// Definir relaciones
// Paciente - Citas
Paciente.hasMany(Cita, {
    foreignKey: 'pacienteId',
    as: 'citas'
});
Cita.belongsTo(Paciente, {
    foreignKey: 'pacienteId',
    as: 'paciente'
});

// Medico - Citas
Medico.hasMany(Cita, {
    foreignKey: 'medicoId',
    as: 'citas'
});
Cita.belongsTo(Medico, {
    foreignKey: 'medicoId',
    as: 'medico'
});

// Paciente - Historial Médico
Paciente.hasMany(HistorialMedico, {
    foreignKey: 'pacienteId',
    as: 'historialMedico'
});
HistorialMedico.belongsTo(Paciente, {
    foreignKey: 'pacienteId',
    as: 'paciente'
});

// Medico - Historial Médico
Medico.hasMany(HistorialMedico, {
    foreignKey: 'medicoId',
    as: 'historiales'
});
HistorialMedico.belongsTo(Medico, {
    foreignKey: 'medicoId',
    as: 'medico'
});

// Paciente - Facturas
Paciente.hasMany(Factura, {
    foreignKey: 'pacienteId',
    as: 'facturas'
});
Factura.belongsTo(Paciente, {
    foreignKey: 'pacienteId',
    as: 'paciente'
});

const db = {
    sequelize,
    User,
    Paciente,
    Medico,
    Cita,
    Factura,
    HistorialMedico,
    Config,
    AuditLog
};

export default db;
