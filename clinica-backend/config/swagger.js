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
                // URL relativa: funciona igual en local, Docker o Vercel
                url: '/',
                description: 'Servidor actual',
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
    apis: [new URL('../routes/*.js', import.meta.url).pathname],
};

const specs = swaggerJsdoc(options);
export default specs;