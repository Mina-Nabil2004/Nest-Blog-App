import { IsString, IsNotEmpty, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(1, { message: 'Content is required' })
    content!: string;

    @ApiProperty()
    @IsUUID('4', { message: 'blogID must be a valid UUID' })
    blogID!: string;
}
