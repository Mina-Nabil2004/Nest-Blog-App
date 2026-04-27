import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtPayload } from './strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    signup(@Body() signupDto: SignupDto) {
        return this.authService.signupUser(signupDto);
    }

    @Post('login')
    @UseGuards(LocalGuard)
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto) {
        return this.authService.loginUser(loginDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh(@Body() body: RefreshTokenDto) {
        return this.authService.refreshTokens(body.refreshToken);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    changePassword(
        @Request() req: { user: JwtPayload },
        @Body() data: ChangePasswordDto,
    ) {
        return this.authService.changeUserPassword(req.user.sub, data);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    logout(@Body() body: RefreshTokenDto) {
        return this.authService.revokeRefreshToken(body.refreshToken);
    }
}
