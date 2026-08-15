import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();
  
  const config = new DocumentBuilder()
    .setTitle('BaaS API - VBA Systems Challenge')
    .setDescription('API BaaS integrada ao Gateway Lera Box')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 API BaaS rodando em: http://localhost:3000`);
  console.log(`📄 Swagger disponível em: http://localhost:3000/api/docs`);
}
bootstrap();