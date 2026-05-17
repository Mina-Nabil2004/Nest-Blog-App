import {
    Body,
    Param,
    Controller,
    Delete,
    Post,
    Get,
    Patch,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';
import { S3FileInterceptor } from '@/common/s3/s3-file.interceptor';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    getUsers() {
        return this.usersService.getAllUsers();
    }

    @Get(':id')
    getUserById(@Param('id', ParseUUIDPipe) userID: string) {
        return this.usersService.getUserById(userID);
    }

    @Get(':id/blogs')
    getUserBlogs(@Param('id', ParseUUIDPipe) userID: string) {
        return this.usersService.getUserBlogs(userID);
    }

    @Get(':id/comments')
    getUserComments(@Param('id', ParseUUIDPipe) userID: string) {
        return this.usersService.getUserComments(userID);
    }

    @Post('me/avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(S3FileInterceptor('image', 'avatars'))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    uploadAvatar(
        @Request() req: { user: JwtPayload },
        @UploadedFile(new ImageValidationPipe(true))
        image: Express.Multer.File,
    ) {
        return this.usersService.uploadAvatar(req.user.sub, image);
    }

    @Delete('me/avatar')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteAvatar(@Request() req: { user: JwtPayload }) {
        return this.usersService.deleteAvatar(req.user.sub);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    updateMe(
        @Request() req: { user: JwtPayload },
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.updateUser(req.user.sub, updateUserDto);
    }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteMe(@Request() req: { user: JwtPayload }) {
        return this.usersService.deleteUser(req.user.sub);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    updateUser(
        @Param('id', ParseUUIDPipe) userID: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.updateUser(userID, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteUser(@Param('id', ParseUUIDPipe) userID: string) {
        return this.usersService.deleteUser(userID);
    }
}
