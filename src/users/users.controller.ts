import {
    Body,
    Param,
    Controller,
    Delete,
    Get,
    Patch,
    ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    getUsers() {
        return this.usersService.getAllUsers();
    }

    @Get(':id')
    getUserById(@Param('id') userID: string) {
        return this.usersService.getUserById(userID);
    }

    @Get(':id/blogs')
    getUserBlogs(@Param('id') userID: string) {
        return this.usersService.getUserBlogs(userID);
    }

    @Get(':id/comments')
    getUserComments(@Param('id') userID: string) {
        return this.usersService.getUserComments(userID);
    }

    @Patch(':id')
    updateUser(
        @Param('id') userID: string,
        @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.updateUser(userID, updateUserDto);
    }

    @Delete(':id')
    deleteUser(@Param('id') userID: string) {
        return this.usersService.deleteUser(userID);
    }
}
