import { IsEnum, IsOptional } from 'class-validator';
import { CreateUserDto } from '../../auth/dtos/create-user.dto';
import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional()
    @IsEnum(['BASIC', 'ADMIN'], {
        message: 'Role must be either BASIC or ADMIN',
    })
    @IsOptional()
    role?: 'BASIC' | 'ADMIN';
}
