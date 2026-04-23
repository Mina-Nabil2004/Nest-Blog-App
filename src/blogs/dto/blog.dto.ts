import { IsString, IsUUID, IsBoolean } from 'class-validator';

export class BlogDto {
    @IsUUID()
    blogID!: string;

    @IsString()
    title!: string;

    @IsString()
    content!: string;

    // @IsUUID()
    // authorID!: string;

    @IsBoolean()
    published!: boolean;

    createdAt!: Date;
    updatedAt!: Date;
}
