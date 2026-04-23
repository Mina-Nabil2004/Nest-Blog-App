import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangePasswordDto } from './dtos/change-password.dto';
import bcrypt from 'bcrypt';
import { User } from '@/users/entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserPublic } from '@/users/dtos/user-public.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async changeUserPassword(
        userID: string,
        data: ChangePasswordDto,
    ): Promise<void> {
        const user = await this.usersRepository.findOneBy({ userID });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(
            data.currentPassword,
            user.passwordHash,
        );
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }
        user.passwordHash = await bcrypt.hash(data.newPassword, 10);
        await this.usersRepository.save(user);
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserPublic> {
        const existingEmail = await this.usersRepository.findOneBy({
            email: createUserDto.email,
        });
        if (existingEmail) {
            throw new BadRequestException('Email already in use');
        }
        const user = this.usersRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            passwordHash: createUserDto.password,
        });
        return this.usersRepository.save(user);
    }
}
