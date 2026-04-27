import { IsEnum, IsOptional } from 'class-validator';
import { SignupDto } from '../../auth/dtos/signup.dto';
import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(SignupDto) {
    @ApiPropertyOptional()
    @IsEnum(['BASIC', 'ADMIN'], {
        message: 'Role must be either BASIC or ADMIN',
    })
    @IsOptional()
    role?: 'BASIC' | 'ADMIN';
}
