import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.getOrThrow<string>('DATABASE_HOST'),
                port: configService.getOrThrow<number>('DATABASE_PORT'),
                username: configService.getOrThrow<string>('DATABASE_USERNAME'),
                password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
                database: configService.getOrThrow<string>('DATABASE_NAME'),
                autoLoadEntities: true,
                synchronize: true, // auto sync schema (disable in production)
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}
