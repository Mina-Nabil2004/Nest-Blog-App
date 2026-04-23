import { UserPublic } from '../../users/dtos/user-public.dto';

export class LoginResponseDto {
    user!: UserPublic;
    accessToken!: string;
    refreshToken!: string;
}
