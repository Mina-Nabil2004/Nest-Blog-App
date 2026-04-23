import { IsString, IsNotEmpty, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(1, { message: 'Content is required' })
    content!: string;

    @ApiProperty()
    @IsUUID('4', { message: 'authorId must be a valid UUID' })
    authorID!: string;

    @ApiProperty()
    @IsUUID('4', { message: 'blogId must be a valid UUID' })
    blogID!: string;
}
