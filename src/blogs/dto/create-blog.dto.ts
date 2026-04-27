import {
    IsString,
    IsNotEmpty,
    MinLength,
    IsOptional,
    IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Title must be at least 3 characters long' })
    title!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(5, { message: 'Content must be at least 5 characters long' })
    content!: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    published?: boolean;
}
