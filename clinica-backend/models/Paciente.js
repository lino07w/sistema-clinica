import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Paciente = sequelize.define('Paciente', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `pac-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dni: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    fechaNacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    genero: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    grupoSanguineo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    alergias: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    contactoEmergencia: {
        type: DataTypes.STRING,
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'pacientes',
    timestamps: true
});

export default Paciente;
