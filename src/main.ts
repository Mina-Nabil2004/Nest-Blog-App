import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/logger.service';
import { ConfigService } from '@nestjs/config';

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

    // RabbitMQ consumer
    const configService = app.get(ConfigService);
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: 'blog_events',
            queueOptions: { durable: true },
            noAck: false,
        },
    });

    await app.startAllMicroservices();
    await app.listen(configService.getOrThrow<number>('PORT'));
    logger.log(
        `Application running on port ${configService.getOrThrow<number>('PORT')}`,
        'Bootstrap',
    );
}
bootstrap();
