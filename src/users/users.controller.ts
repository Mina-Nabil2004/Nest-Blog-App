import {
    Body,
    Param,
    Controller,
    Delete,
    Get,
    Patch,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

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
