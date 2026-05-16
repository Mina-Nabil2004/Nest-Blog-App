import { ApiProperty } from '@nestjs/swagger';
import { UserPublic } from '../../users/dtos/user-public.dto';

export class LoginResponseDto {
    @ApiProperty()
    user!: UserPublic;

    @ApiProperty()
    accessToken!: string;

    @ApiProperty()
    refreshToken!: string;
}
