import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Medico = sequelize.define('Medico', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    especialidad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    matricula: {
        type: DataTypes.STRING,
        unique: true,
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
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'medicos',
    timestamps: true
});

export default Medico;
