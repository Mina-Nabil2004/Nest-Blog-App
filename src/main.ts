import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/logger.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    // Custom file-backed logger
    const logger = app.get(AppLogger);
    app.useLogger(logger);

    // Global validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Blog App API')
        .setDescription('NestJS Blog REST API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

    await app.listen(process.env.PORT ?? 8080);
    logger.log(
        `Application running on port ${process.env.PORT ?? 8080}`,
        'Bootstrap',
    );
}
bootstrap();
