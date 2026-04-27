import { IsString, IsUUID } from 'class-validator';
import { UserPublic } from '@/users/dtos/user-public.dto';

export class CommentDto {
    @IsUUID()
    commentID!: string;

    @IsString()
    content!: string;

    author!: UserPublic;
    blogID!: string;

    createdAt!: Date;
    updatedAt!: Date;
}
