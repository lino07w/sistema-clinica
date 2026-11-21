/**
 * Especificación OpenAPI 3 de la API.
 *
 * Se define como objeto (en lugar de comentarios JSDoc) para tener la
 * documentación en un solo lugar y no depender de leer archivos en
 * tiempo de ejecución (importante en entornos serverless).
 */

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const ok = (description, schema) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          ...(schema && { data: schema })
        }
      }
    }
  }
});

const error = (description) => ({
  description,
  content: { 'application/json': { schema: ref('Error') } }
});

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };

const jsonBody = (schema) => ({
  required: true,
  content: { 'application/json': { schema } }
});

/** Genera las operaciones CRUD estándar para un recurso. */
const crud = ({ tag, schema, input, listDescription }) => ({
  collection: {
    get: {
      tags: [tag],
      summary: `Listar ${tag.toLowerCase()}`,
      description: listDescription,
      responses: { 200: ok('Listado', { type: 'array', items: ref(schema) }), 401: error('No autenticado'), 403: error('Sin permisos') }
    },
    post: {
      tags: [tag],
      summary: `Crear (${tag.toLowerCase()})`,
      requestBody: jsonBody(ref(input)),
      responses: { 201: ok('Creado', ref(schema)), 400: error('Datos inválidos'), 409: error('Conflicto / duplicado') }
    }
  },
  item: {
    get: {
      tags: [tag],
      summary: 'Obtener por ID',
      parameters: [idParam],
      responses: { 200: ok('Encontrado', ref(schema)), 404: error('No encontrado') }
    },
    put: {
      tags: [tag],
      summary: 'Actualizar',
      parameters: [idParam],
      requestBody: jsonBody(ref(input)),
      responses: { 200: ok('Actualizado', ref(schema)), 404: error('No encontrado'), 409: error('Conflicto') }
    },
    delete: {
      tags: [tag],
      summary: 'Eliminar',
      parameters: [idParam],
      responses: { 200: ok('Eliminado'), 404: error('No encontrado'), 409: error('Tiene registros asociados') }
    }
  }
});

const pacientes = crud({ tag: 'Pacientes', schema: 'Paciente', input: 'PacienteInput' });
const medicos = crud({ tag: 'Medicos', schema: 'Medico', input: 'MedicoInput' });
const citas = crud({
  tag: 'Citas',
  schema: 'Cita',
  input: 'CitaInput',
  listDescription: 'Un médico sólo recibe sus propias citas; administrador y recepcionista ven todas.'
});

const specs = {
  openapi: '3.0.3',
  info: {
    title: 'API Sistema de Gestión de Clínica',
    version: '1.0.0',
    description:
      'API REST para gestionar pacientes, médicos, citas, historial médico y facturación con control de acceso por roles.\n\n' +
      '**Cómo probarla:** ejecuta `POST /api/auth/login`, copia el `token` de la respuesta y pégalo en **Authorize**.'
  },
  servers: [{ url: '/', description: 'Servidor actual' }],
  tags: [
    { name: 'Auth', description: 'Registro, login y recuperación de contraseña' },
    { name: 'Pacientes' },
    { name: 'Medicos' },
    { name: 'Citas' },
    { name: 'Sistema' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Paciente no encontrado' },
          errors: {
            type: 'array',
            items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } }
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
          nombre: { type: 'string' },
          rol: { type: 'string', enum: ['administrador', 'medico', 'recepcionista', 'paciente'] },
          estado: { type: 'string', enum: ['activo', 'inactivo', 'pendiente', 'rechazado'] },
          medicoId: { type: 'string', nullable: true },
          pacienteId: { type: 'string', nullable: true }
        }
      },
      PacienteInput: {
        type: 'object',
        required: ['nombre', 'dni', 'fechaNacimiento'],
        properties: {
          nombre: { type: 'string', example: 'Juan Pérez' },
          dni: { type: 'string', example: '12345678' },
          fechaNacimiento: { type: 'string', format: 'date', example: '1985-03-12' },
          genero: { type: 'string', example: 'Masculino' },
          telefono: { type: 'string', example: '987654321' },
          email: { type: 'string', format: 'email' },
          direccion: { type: 'string' },
          grupoSanguineo: { type: 'string', example: 'O+' },
          alergias: { type: 'string' }
        }
      },
      Paciente: {
        allOf: [
          { type: 'object', properties: { id: { type: 'string' }, activo: { type: 'boolean' } } },
          ref('PacienteInput')
        ]
      },
      MedicoInput: {
        type: 'object',
        required: ['nombre', 'especialidad'],
        properties: {
          nombre: { type: 'string', example: 'Dra. Ana Torres' },
          especialidad: { type: 'string', example: 'Pediatría' },
          matricula: { type: 'string', example: 'CMP-51234' },
          telefono: { type: 'string' },
          email: { type: 'string', format: 'email' }
        }
      },
      Medico: {
        allOf: [
          { type: 'object', properties: { id: { type: 'string' }, activo: { type: 'boolean' } } },
          ref('MedicoInput')
        ]
      },
      CitaInput: {
        type: 'object',
        required: ['pacienteId', 'medicoId', 'fecha', 'hora'],
        properties: {
          pacienteId: { type: 'string' },
          medicoId: { type: 'string' },
          fecha: { type: 'string', format: 'date', example: '2030-01-15' },
          hora: { type: 'string', example: '10:00' },
          motivo: { type: 'string', example: 'Consulta general' },
          estado: { type: 'string', enum: ['programada', 'completada', 'cancelada'] },
          notas: { type: 'string' }
        }
      },
      Cita: {
        allOf: [{ type: 'object', properties: { id: { type: 'string' } } }, ref('CitaInput')]
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Estado del servicio',
        security: [],
        responses: { 200: ok('Servicio disponible'), 503: error('Base de datos inaccesible') }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['usernameOrEmail', 'password'],
          properties: {
            usernameOrEmail: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'demo1234' }
          }
        }),
        responses: {
          200: ok('Login exitoso', {
            type: 'object',
            properties: { token: { type: 'string' }, user: ref('User') }
          }),
          401: error('Credenciales inválidas'),
          403: error('Cuenta pendiente, rechazada o inactiva')
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Solicitar acceso (médico o recepcionista)',
        description: 'La cuenta queda en estado `pendiente` hasta que un administrador la apruebe.',
        security: [],
        requestBody: jsonBody({
          type: 'object',
          required: ['email', 'password', 'nombre', 'rol'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            nombre: { type: 'string' },
            rol: { type: 'string', enum: ['medico', 'recepcionista'] },
            telefono: { type: 'string' },
            especialidad: { type: 'string' },
            matricula: { type: 'string' }
          }
        }),
        responses: {
          201: ok('Solicitud registrada', ref('User')),
          400: error('Datos inválidos'),
          403: error('Rol no permitido'),
          409: error('Email ya registrado')
        }
      }
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Solicitar enlace de recuperación',
        description: 'Responde igual exista o no el email, para no revelar qué cuentas existen.',
        security: [],
        requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }),
        responses: { 200: ok('Solicitud procesada') }
      }
    },
    '/api/auth/reset-password/{token}': {
      post: {
        tags: ['Auth'],
        summary: 'Restablecer contraseña',
        security: [],
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ type: 'object', required: ['password'], properties: { password: { type: 'string', minLength: 6 } } }),
        responses: { 200: ok('Contraseña actualizada'), 400: error('Token inválido o expirado') }
      }
    },
    '/api/pacientes': pacientes.collection,
    '/api/pacientes/{id}': pacientes.item,
    '/api/medicos': medicos.collection,
    '/api/medicos/{id}': medicos.item,
    '/api/citas': citas.collection,
    '/api/citas/{id}': citas.item
  }
};

export default specs;
