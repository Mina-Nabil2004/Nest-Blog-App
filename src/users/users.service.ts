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
import { Logger } from '@nestjs/common';
import { S3Service } from '@/common/s3/s3.service';
import 'multer-s3';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly s3Service: S3Service,
    ) {}

    async getUserById(userID: string): Promise<UserPublic> {
        const user = await this.usersRepository.findOneBy({ userID });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.toPublicUser(user);
    }

    async getAllUsers(): Promise<UserPublic[]> {
        return (await this.usersRepository.find()).map((user) =>
            this.toPublicUser(user),
        );
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
        return this.toPublicUser(await this.usersRepository.save(user));
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
        return this.toPublicUser(await this.usersRepository.save(user));
    }

    async deleteUser(userID: string): Promise<void> {
        const user = await this.usersRepository.findOneBy({ userID });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.s3Service.deleteObject(user.avatarUrl);
        await this.usersRepository.remove(user);
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

    async uploadAvatar(
        userID: string,
        image: Express.Multer.File,
    ): Promise<UserPublic> {
        const user = await this.usersRepository.findOneBy({ userID });
        if (!user) throw new NotFoundException('User not found');

        await this.s3Service.deleteObject(user.avatarUrl);
        user.avatarUrl = (image as Express.MulterS3.File).location;

        return this.toPublicUser(await this.usersRepository.save(user));
    }

    async deleteAvatar(userID: string): Promise<void> {
        const user = await this.usersRepository.findOneBy({ userID });
        if (!user) throw new NotFoundException('User not found');

        await this.s3Service.deleteObject(user.avatarUrl);
        user.avatarUrl = null;
        await this.usersRepository.save(user);
    }

    private toPublicUser(user: User): UserPublic {
        const { passwordHash, ...publicUser } = user;
        void passwordHash;
        return publicUser as UserPublic;
    }
}
