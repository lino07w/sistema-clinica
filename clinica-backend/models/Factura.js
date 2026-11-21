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
        allowNull: false,
        // pg devuelve DECIMAL como string para no perder precisión; los montos
        // de 2 decimales caben en un Number, así la API expone un número.
        get() {
            const value = this.getDataValue('monto');
            return value === null ? null : Number(value);
        }
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
