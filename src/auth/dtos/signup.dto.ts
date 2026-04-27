import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Name is required' })
    name!: string;

    @ApiProperty()
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty()
    email!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password!: string;
}
