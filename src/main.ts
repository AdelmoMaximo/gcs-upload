import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o pipe de validação globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Lança um erro se propriedades extras forem enviadas
      transform: true, // Transforma o payload para o tipo do DTO
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('GCP JSON Uploader API')
    .setDescription('API para salvar um JSON no GCS bucket pass-queue')
    .setVersion('1.0')
    .addTag('uploads')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // A documentação estará em /api-docs

  await app.listen(3000);
}
bootstrap();
