import { IsEmail, IsString, IsUUID } from 'class-validator';

export class UserPublic {
    @IsUUID()
    userID!: string;

    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    role!: 'BASIC' | 'ADMIN';

    createdAt!: Date;
    updatedAt!: Date;
}
