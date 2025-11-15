//src/swagger/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Database Module API',
      version: '1.0.0',
      description: 'API REST del módulo de base de datos (Eventos, Asistentes, Entradas, Notificaciones)'
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
