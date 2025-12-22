import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Config = sequelize.define('Config', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombreClinica: {
        type: DataTypes.STRING,
        defaultValue: 'Clínica Médica'
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    horarioAtencion: {
        type: DataTypes.STRING,
        defaultValue: 'Lun-Vie: 8:00-18:00, Sáb: 8:00-13:00'
    },
    moneda: {
        type: DataTypes.STRING,
        defaultValue: 'S/'
    },
    logo: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'config',
    timestamps: true
});

export default Config;
