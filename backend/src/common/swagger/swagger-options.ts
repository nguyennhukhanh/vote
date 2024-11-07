import type { Options } from 'swagger-jsdoc';

const currentDir = process.cwd();

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vote API',
      version: '1.0.0',
      description: 'API documentation for Vote app',
    },
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
  apis: [`${currentDir}/src/modules/**/*.controller.ts`],
};
