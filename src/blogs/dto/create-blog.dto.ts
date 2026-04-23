import {
    IsString,
    IsNotEmpty,
    MinLength,
    IsUUID,
    IsOptional,
    IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

    @ApiProperty()
    @IsUUID('4', { message: 'authorId must be a valid UUID' })
    @IsNotEmpty()
    authorID!: string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    published?: boolean;
}
