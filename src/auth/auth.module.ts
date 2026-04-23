import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '@/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RefreshToken, User])],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
