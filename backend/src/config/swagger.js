/**
 * SWAGGER CONFIGURATION
 * =====================
 * This file configures the OpenAPI/Swagger documentation for the API.
 * 
 * Why Swagger?
 * - Provides an interactive UI to test all API endpoints.
 * - Serves as a living documentation for frontend developers.
 * - Standardizes API structure descriptions.
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Seller Admin System API',
      version: '1.0.0',
      description: 'API documentation for the Full-stack Seller and Admin Management System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
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
  },
  // Path to the API docs (inline comments in route files)
  apis: ['./src/routes/*.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = specs;
