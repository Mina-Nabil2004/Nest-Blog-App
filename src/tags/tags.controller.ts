import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Get()
    getAllTags() {
        return this.tagsService.getAllTags();
    }

    @Get(':id')
    getTagById(@Param('id', ParseUUIDPipe) id: string) {
        return this.tagsService.getTagById(id);
    }

    @Get(':id/blogs')
    getBlogsByTag(@Param('id', ParseUUIDPipe) id: string) {
        return this.tagsService.getBlogsByTag(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    createTag(@Body() createTagDto: CreateTagDto) {
        return this.tagsService.createTag(createTagDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    updateTag(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTagDto: UpdateTagDto,
    ) {
        return this.tagsService.updateTag(id, updateTagDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteTag(@Param('id', ParseUUIDPipe) id: string) {
        return this.tagsService.deleteTag(id);
    }
}
