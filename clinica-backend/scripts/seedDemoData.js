import db from '../models/index.js';

const { sequelize, User, Paciente, Medico, Cita, Factura, HistorialMedico, Config } = db;

async function seedData() {
    try {
        console.log('🌱 Iniciando carga de datos de demostración...');

        // Sincronizar (limpiar base de datos si es necesario)
        await sequelize.sync({ force: true });
        console.log('✅ Base de datos reseteada');

        // 1. Configuración Inicial
        await Config.create({
            nombreClinica: 'Centro Médico San José',
            horarioAtencion: 'Lunes a Viernes 08:00 - 20:00, Sábados 08:00 - 14:00',
            moneda: 'S/',
            direccion: 'Av. Las Palmeras 123, Lima',
            telefono: '01 444-5555'
        });

        // 2. Usuarios del personal
        await User.create({
            username: 'admin',
            email: 'admin@clinica.com',
            password: '123456', // Se hashea automáticamente por el hook beforeCreate del modelo User
            nombre: 'Administrador Demo',
            rol: 'administrador',
            estado: 'activo'
        });

        // 3. Médicos
        const medicosData = [
            { nombre: 'Dr. Carlos Mendoza', especialidad: 'Cardiología', matricula: 'CMP-45678', email: 'c.mendoza@clinica.com' },
            { nombre: 'Dra. Ana Torres', especialidad: 'Pediatría', matricula: 'CMP-51234', email: 'a.torres@clinica.com' },
            { nombre: 'Dr. Roberto Luna', especialidad: 'Dermatología', matricula: 'CMP-39876', email: 'r.luna@clinica.com' },
            { nombre: 'Dra. María Jara', especialidad: 'Ginecología', matricula: 'CMP-62345', email: 'm.jara@clinica.com' },
            { nombre: 'Dr. Sergio Ramos', especialidad: 'Traumatología', matricula: 'CMP-41256', email: 's.ramos@clinica.com' }
        ];

        const medicos = [];
        for (const data of medicosData) {
            const medico = await Medico.create(data);
            medicos.push(medico);

            // Crear usuario para el médico
            await User.create({
                username: data.email.split('@')[0],
                email: data.email,
                password: 'password123',
                nombre: data.nombre,
                rol: 'medico',
                estado: 'activo',
                medicoId: medico.id
            });
        }
        console.log('✅ 5 Médicos creados');

        // 4. Pacientes
        const pacientesData = [
            { id: 'PAC-1001', nombre: 'Juan Pérez', dni: '12345678', telefono: '987654321', email: 'juan.perez@email.com', direccion: 'Calle Falsa 123' },
            { id: 'PAC-1002', nombre: 'Lucía Méndez', dni: '87654321', telefono: '912345678', email: 'lucia.m@email.com', direccion: 'Av. Los Incas 456' },
            { id: 'PAC-1003', nombre: 'Ricardo Salinas', dni: '45678123', telefono: '955443322', email: 'salinas.r@email.com', direccion: 'Jr. Miraflores 789' },
            { id: 'PAC-1004', nombre: 'Elena Guerra', dni: '11223344', telefono: '944332211', email: 'elena.g@email.com', direccion: 'Urb. La Luz B-12' },
            { id: 'PAC-1005', nombre: 'Marcos Ruiz', dni: '55667788', telefono: '966778899', email: 'mruiz@email.com', direccion: 'Calle Comercio 555' }
        ];

        const pacientes = [];
        for (const data of pacientesData) {
            const paciente = await Paciente.create(data);
            pacientes.push(paciente);
        }
        console.log('✅ 5 Pacientes creados');

        // 5. Citas (Pasadas y Futuras)
        const hoy = new Date();
        const dias = [-10, -5, -2, 0, 1, 3, 7];

        for (let i = 0; i < 15; i++) {
            const randomPaciente = pacientes[Math.floor(Math.random() * pacientes.length)];
            const randomMedico = medicos[Math.floor(Math.random() * medicos.length)];
            const randomDia = dias[Math.floor(Math.random() * dias.length)];

            const fechaCita = new Date();
            fechaCita.setDate(hoy.getDate() + randomDia);

            const estado = randomDia < 0 ? 'completada' : (randomDia === 0 ? 'pendiente' : 'programada');

            const cita = await Cita.create({
                pacienteId: randomPaciente.id,
                medicoId: randomMedico.id,
                fecha: fechaCita.toISOString().split('T')[0],
                hora: `${8 + (i % 8)}:00`,
                motivo: i % 2 === 0 ? 'Consulta General' : 'Control de Tratamiento',
                estado: estado
            });

            // Si la cita está completada, crear historial y factura
            if (estado === 'completada') {
                await HistorialMedico.create({
                    pacienteId: randomPaciente.id,
                    medicoId: randomMedico.id,
                    diagnostico: 'Paciente presenta mejoría notable en los síntomas.',
                    tratamiento: 'Continuar medicación por 2 semanas más.',
                    observaciones: 'Recomendación de reposo moderado.'
                });

                await Factura.create({
                    pacienteId: randomPaciente.id,
                    citaId: cita.id,
                    monto: 150.00,
                    estado: 'pagado',
                    fechaEmision: fechaCita
                });
            }
        }
        console.log('✅ 15 Citas con historial y facturas generadas');

        console.log('\n🚀 ¡Población de datos de demo completada con éxito!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error cargando datos de demo:', error);
        process.exit(1);
    }
}

seedData();
