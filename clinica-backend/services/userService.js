import { Op } from 'sequelize';
import db from '../models/index.js';
const { User, Paciente, sequelize } = db;

class UserService {
    async getAll() {
        return await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
    }

    async getPendientes() {
        return await User.findAll({
            where: { estado: 'pendiente' },
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
    }

    async getById(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) throw new Error('Usuario no encontrado');
        return user;
    }

    async create(userData) {
        // Verificar email duplicado
        const existingEmail = await User.findOne({ where: { email: userData.email } });
        if (existingEmail) throw new Error('El email ya está registrado');

        // Verificar username duplicado si se proporciona
        if (userData.username) {
            const existingUsername = await User.findOne({ where: { username: userData.username } });
            if (existingUsername) throw new Error('El username ya está en uso');
        }
        // Crear usuario (y ficha de paciente si aplica) dentro de una transacción
        const t = await sequelize.transaction();
        try {
            const newUser = await User.create({
                ...userData,
                estado: 'activo', // Admin crea usuarios ya activos
                fechaCreacion: new Date().toISOString().split('T')[0]
            }, { transaction: t });

            // Si es paciente, crear ficha en tabla `pacientes` y vincular
            if (newUser.rol === 'paciente') {
                const pacientePayload = {
                    id: userData.pacienteId || undefined,
                    nombre: userData.nombre,
                    dni: userData.dni || '',
                    fechaNacimiento: userData.fechaNacimiento || null,
                    genero: userData.genero || 'No especificado',
                    telefono: userData.telefono || null,
                    email: userData.email || null,
                    direccion: userData.direccion || null,
                    activo: true
                };

                const paciente = await Paciente.create(pacientePayload, { transaction: t });
                await newUser.update({ pacienteId: paciente.id }, { transaction: t });
            }

            await t.commit();
            return newUser;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async update(id, userData) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('Usuario no encontrado');

        // Verificar email duplicado al actualizar
        if (userData.email && userData.email !== user.email) {
            const existingEmail = await User.findOne({
                where: {
                    email: userData.email,
                    id: { [Op.ne]: id }
                }
            });
            if (existingEmail) throw new Error('El email ya está en uso');
        }

        return await user.update(userData);
    }

    async delete(id) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('Usuario no encontrado');

        // No permitir eliminar al único admin
        if (user.rol === 'administrador') {
            const adminCount = await User.count({ where: { rol: 'administrador' } });
            if (adminCount === 1) {
                throw new Error('No se puede eliminar al único administrador del sistema');
            }
        }

        await user.destroy();
        return true;
    }

    async aprobar(id) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('Usuario no encontrado');
        if (user.estado !== 'pendiente') {
            throw new Error('El usuario no está pendiente de aprobación');
        }

        return await user.update({ estado: 'activo' });
    }

    async rechazar(id, motivo) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('Usuario no encontrado');
        if (user.estado !== 'pendiente') {
            throw new Error('El usuario no está pendiente de aprobación');
        }

        return await user.update({
            estado: 'rechazado',
            motivoRechazo: motivo || 'No especificado'
        });
    }

    async cambiarEstado(id, estado) {
        if (!['activo', 'inactivo'].includes(estado)) {
            throw new Error('Estado inválido. Use: activo o inactivo');
        }

        const user = await User.findByPk(id);
        if (!user) throw new Error('Usuario no encontrado');

        return await user.update({ estado });
    }

    // Métodos para autenticación
    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    async findByUsername(username) {
        return await User.findOne({ where: { username } });
    }

    async updateLastAccess(id) {
        const user = await User.findByPk(id);
        if (user) {
            await user.update({
                ultimoAcceso: new Date().toISOString().split('T')[0]
            });
        }
        return user;
    }
}

export default new UserService();
