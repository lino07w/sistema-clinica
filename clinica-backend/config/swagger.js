 import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Sistema de Gestión de Clínica',
            version: '1.0.0',
            description: 'Documentación de la API para el sistema de gestión de clínica con PostgreSQL',
            contact: {
                name: 'Soporte Técnico',
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' 
                    ? 'https://clinica-backend.onrender.com'  // Ajusta con tu URL real
                    : 'http://localhost:3000',
                description: process.env.NODE_ENV === 'production' 
                    ? 'Servidor de Producción'
                    : 'Servidor de Desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
export default specs;