import { IsString, IsUUID } from 'class-validator';

export class CommentDto {
    @IsUUID()
    commentID!: string;

    @IsString()
    content!: string;

    // @IsUUID()
    // authorID!: string;

    // @IsUUID()
    // blogID!: string;

    createdAt!: Date;
    updatedAt!: Date;
}
