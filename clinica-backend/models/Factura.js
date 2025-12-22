import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Factura = sequelize.define('Factura', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    pacienteId: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: 'pacientes',
            key: 'id'
        }
    },
    pacienteNombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    concepto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'pagada', 'anulada'),
        defaultValue: 'pendiente'
    }
}, {
    tableName: 'facturas',
    timestamps: true
});

export default Factura;
