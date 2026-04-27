import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenSubscriber } from './refresh-token.subscriber';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '@/users/entities/user.entity';
import { StringValue } from 'ms';

@Module({
    imports: [
        PassportModule,
        TypeOrmModule.forFeature([User, RefreshToken]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
                signOptions: {
                    expiresIn: configService.getOrThrow<StringValue>(
                        'ACCESS_TOKEN_EXPIRY',
                    ),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        RefreshTokenSubscriber,
    ],
})
export class AuthModule {}
