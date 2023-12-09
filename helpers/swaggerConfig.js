const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BackEnd',
            version: '1.0.2',
            description: 'Projeto Faculdade',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local',
            },
        ],
    },
    apis: ['./control/*.js', './helpers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
