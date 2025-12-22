import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    usuarioId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    usuarioNombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entidad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    detalles: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'audit_logs',
    timestamps: false
});

export default AuditLog;
