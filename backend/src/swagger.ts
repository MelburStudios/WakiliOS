import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WakiliOS API Documentation',
      version: '1.0.0',
      description: 'A legal services platform developed at Melbur Studios',
      contact: {
        name: 'Melbur Studios',
        email: 'studios@melbur.co.ke'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'WakiliOS server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
