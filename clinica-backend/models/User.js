import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `usr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('administrador', 'medico', 'recepcionista', 'paciente'),
        allowNull: false
    },
    loginType: {
        type: DataTypes.STRING,
        defaultValue: 'email'
    },
    estado: {
        type: DataTypes.ENUM('activo', 'inactivo', 'pendiente', 'rechazado'),
        defaultValue: 'pendiente'
    },
    motivoRechazo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true
    },
    especialidad: {
        type: DataTypes.STRING,
        allowNull: true
    },
    matricula: {
        type: DataTypes.STRING,
        allowNull: true
    },
    medicoId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pacienteId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fechaCreacion: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    ultimoAcceso: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default User;
