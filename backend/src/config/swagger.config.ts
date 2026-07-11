import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = () =>
  new DocumentBuilder()
    .setTitle('TeamBoard API')
    .setDescription(
      'TeamBoard HTTP API for authentication, projects, and task collaboration.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token returned from signup or login.',
      },
      'JWT',
    )
    .build();
