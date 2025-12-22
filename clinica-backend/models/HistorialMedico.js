import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HistorialMedico = sequelize.define('HistorialMedico', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `his-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    pacienteId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'pacientes',
            key: 'id'
        }
    },
    medicoId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'medicos',
            key: 'id'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    diagnostico: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tratamiento: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    prescripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    archivosAdjuntos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'historial_medico',
    timestamps: true
});

export default HistorialMedico;
