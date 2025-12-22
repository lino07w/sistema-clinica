import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cita = sequelize.define('Cita', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `cit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
    hora: {
        type: DataTypes.STRING,
        allowNull: false
    },
    motivo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('programada', 'completada', 'cancelada'),
        defaultValue: 'programada'
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'citas',
    timestamps: true
});

export default Cita;
