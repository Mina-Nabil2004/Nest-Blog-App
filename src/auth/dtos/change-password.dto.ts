import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(8, {
        message: 'Current password must be at least 8 characters long',
    })
    currentPassword!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(8, {
        message: 'New password must be at least 8 characters long',
    })
    newPassword!: string;
}
