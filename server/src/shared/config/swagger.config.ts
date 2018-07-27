import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Buffalo Web Application')
  .setDescription('APIs for all buffalo applications.')
  .setBasePath('/api')
  .addTag('Auth', 'Authentication APIs')
  .addBearerAuth('Authorization', 'header', 'apiKey')
  .build();
