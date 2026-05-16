import { IsString, IsUUID } from 'class-validator';

export class TagDto {
    @IsUUID()
    tagID!: string;

    @IsString()
    name!: string;
}
