import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserPublic } from './dtos/user-public.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async getUserById(userID: string): Promise<UserPublic> {
        const user = await this.usersRepository.findOneBy({ userID });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async getAllUsers(): Promise<UserPublic[]> {
        return this.usersRepository.find();
    }

    async updateUser(
        userID: string,
        updateUserDto: UpdateUserDto,
    ): Promise<UserPublic> {
        const user = await this.usersRepository.findOneBy({ userID });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (updateUserDto.email) {
            const existingEmail = await this.usersRepository.findOneBy({
                email: updateUserDto.email,
            });
            if (existingEmail && existingEmail.userID !== userID) {
                throw new BadRequestException('Email already in use');
            }
        }
        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    async changeUserRole(
        userID: string,
        newRole: 'BASIC' | 'ADMIN',
    ): Promise<UserPublic> {
        const user = await this.usersRepository.findOneBy({ userID });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.role = newRole;
        return this.usersRepository.save(user);
    }

    async deleteUser(userID: string): Promise<void> {
        const user = await this.usersRepository.findOneBy({ userID });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.usersRepository.delete({ userID });
    }

    async getUserBlogs(userID: string) {
        const user = await this.usersRepository.findOne({
            where: { userID },
            relations: ['blogs'],
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user.blogs;
    }

    async getUserComments(userID: string) {
        const user = await this.usersRepository.findOne({
            where: { userID },
            relations: ['comments'],
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user.comments;
    }
}
