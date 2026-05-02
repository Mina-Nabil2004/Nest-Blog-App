import { IsString, IsUUID, IsBoolean, IsUrl } from 'class-validator';
import { UserPublic } from '@/users/dtos/user-public.dto';

export class BlogDto {
    @IsUUID()
    blogID!: string;

    @IsString()
    title!: string;

    @IsString()
    content!: string;

    @IsUrl()
    imageUrl?: string;

    author!: UserPublic;

    @IsBoolean()
    published!: boolean;

    createdAt!: Date;
    updatedAt!: Date;
}
