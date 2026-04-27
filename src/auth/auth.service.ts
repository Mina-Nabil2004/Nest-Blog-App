import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import ms, { StringValue } from 'ms';
import { Cron, CronExpression } from '@nestjs/schedule';

import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { UserPublic } from '../users/dtos/user-public.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    private readonly bcryptRounds: number;
    private readonly refreshTokenSecret: string;
    private readonly refreshTokenExpiry: string;

    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokensRepo: Repository<RefreshToken>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.bcryptRounds = parseInt(
            configService.getOrThrow('BCRYPT_ROUNDS'),
            10,
        );
        this.refreshTokenSecret = configService.getOrThrow(
            'REFRESH_TOKEN_SECRET',
        );
        this.refreshTokenExpiry = configService.getOrThrow(
            'REFRESH_TOKEN_EXPIRY',
        );
    }

    async validateUser(
        email: string,
        password: string,
    ): Promise<UserPublic | null> {
        const user = await this.usersRepo.findOneBy({ email });
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        return isValid ? this.toPublicUser(user) : null;
    }

    async signupUser(dto: SignupDto): Promise<UserPublic> {
        const exists = await this.usersRepo.findOneBy({ email: dto.email });
        if (exists) throw new BadRequestException('Email already in use');

        const user = this.usersRepo.create({
            name: dto.name,
            email: dto.email,
            passwordHash: await bcrypt.hash(dto.password, this.bcryptRounds),
        });

        return this.toPublicUser(await this.usersRepo.save(user));
    }

    async loginUser(dto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.usersRepo.findOneBy({ email: dto.email });
        if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user);
        return { user: this.toPublicUser(user), ...tokens };
    }

    async refreshTokens(
        rawRefreshToken: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = this.verifyToken(
            rawRefreshToken,
            'REFRESH_TOKEN_SECRET',
        );

        const storedTokens = await this.refreshTokensRepo.find({
            where: { user: { userID: payload.sub }, isRevoked: false },
            relations: ['user'],
        });

        const matched = await this.findMatchingToken(
            rawRefreshToken,
            storedTokens,
        );
        if (!matched) {
            throw new UnauthorizedException('Refresh token not recognised');
        }

        matched.isRevoked = true;
        await this.refreshTokensRepo.save(matched);

        return this.generateTokens(matched.user);
    }

    async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
        const payload = this.verifyToken(
            rawRefreshToken,
            'REFRESH_TOKEN_SECRET',
        );

        const storedTokens = await this.refreshTokensRepo.find({
            where: { user: { userID: payload.sub }, isRevoked: false },
        });

        const matched = await this.findMatchingToken(
            rawRefreshToken,
            storedTokens,
        );
        if (!matched) return;

        matched.isRevoked = true;
        await this.refreshTokensRepo.save(matched);
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupExpiredTokens(): Promise<void> {
        await this.refreshTokensRepo.delete({
            expiresAt: LessThan(new Date()),
        });
    }

    async changeUserPassword(
        userID: string,
        dto: ChangePasswordDto,
    ): Promise<void> {
        const user = await this.usersRepo.findOneBy({ userID });
        if (!user) throw new NotFoundException('User not found');

        const isValid = await bcrypt.compare(
            dto.currentPassword,
            user.passwordHash,
        );
        if (!isValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }
        user.passwordHash = await bcrypt.hash(
            dto.newPassword,
            this.bcryptRounds,
        );
        await this.usersRepo.save(user);

        await this.refreshTokensRepo.update(
            { user: { userID }, isRevoked: false },
            { isRevoked: true },
        );
    }

    private async generateTokens(
        user: User,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload: JwtPayload = {
            sub: user.userID,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        const rawRefreshToken = this.jwtService.sign(payload, {
            secret: this.refreshTokenSecret,
            expiresIn: this.refreshTokenExpiry as StringValue,
        });

        const tokenHash = await bcrypt.hash(rawRefreshToken, this.bcryptRounds);
        const expiresAt = new Date(
            Date.now() + ms(this.refreshTokenExpiry as StringValue),
        );

        await this.refreshTokensRepo.save(
            this.refreshTokensRepo.create({ tokenHash, expiresAt, user }),
        );

        return { accessToken, refreshToken: rawRefreshToken };
    }

    private async findMatchingToken(
        rawToken: string,
        storedTokens: RefreshToken[],
    ): Promise<RefreshToken | null> {
        for (const stored of storedTokens) {
            if (await bcrypt.compare(rawToken, stored.tokenHash)) return stored;
        }
        return null;
    }

    private verifyToken(token: string, secretKey: string): JwtPayload {
        try {
            return this.jwtService.verify<JwtPayload>(token, {
                secret: this.configService.getOrThrow<string>(secretKey),
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private toPublicUser(user: User): UserPublic {
        const { passwordHash, ...publicUser } = user;
        void passwordHash;
        return publicUser as UserPublic;
    }
}
