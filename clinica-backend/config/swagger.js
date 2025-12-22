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
                url: 'http://localhost:3000',
                description: 'Servidor de Desarrollo',
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
    apis: ['./routes/*.js'], // Documentación en las rutas
};

const specs = swaggerJsdoc(options);
export default specs;
