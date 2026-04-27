import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) {}

    @Get()
    getAllBlogs() {
        return this.blogsService.getAllBlogs();
    }

    @Get('published')
    getPublishedBlogs() {
        return this.blogsService.getPublishedBlogs();
    }

    @Get('author/:authorID')
    getBlogsByAuthor(@Param('authorID', ParseUUIDPipe) authorID: string) {
        return this.blogsService.getBlogsByAuthor(authorID);
    }

    @Get(':id')
    getBlogById(@Param('id', ParseUUIDPipe) blogID: string) {
        return this.blogsService.getBlogById(blogID);
    }

    @Get(':id/tags')
    getBlogTags(@Param('id', ParseUUIDPipe) blogID: string) {
        return this.blogsService.getBlogTags(blogID);
    }

    @Get(':id/comments')
    getBlogComments(@Param('id', ParseUUIDPipe) blogID: string) {
        return this.blogsService.getBlogComments(blogID);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    createBlog(
        @Request() req: { user: JwtPayload },
        @Body() createBlogDto: CreateBlogDto,
    ) {
        return this.blogsService.createBlog(req.user.sub, createBlogDto);
    }

    @Post(':id/tags/:tagId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    addTagToBlog(
        @Param('id', ParseUUIDPipe) blogID: string,
        @Param('tagId') tagID: string,
    ) {
        return this.blogsService.addTagToBlog(blogID, tagID);
    }

    @Delete(':id/tags/:tagId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removeTagFromBlog(
        @Param('id', ParseUUIDPipe) blogID: string,
        @Param('tagId', ParseUUIDPipe) tagID: string,
    ) {
        return this.blogsService.removeTagFromBlog(blogID, tagID);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    updateBlog(
        @Param('id', ParseUUIDPipe) blogID: string,
        @Body() updateBlogDto: UpdateBlogDto,
    ) {
        return this.blogsService.updateBlog(blogID, updateBlogDto);
    }

    @Patch(':id/publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    publishBlog(
        @Param('id', ParseUUIDPipe) blogID: string,
        @Request() req: { user: JwtPayload },
    ) {
        return this.blogsService.publishBlog(blogID, req.user.sub);
    }

    @Patch(':id/unpublish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    unpublishBlog(
        @Param('id', ParseUUIDPipe) blogID: string,
        @Request() req: { user: JwtPayload },
    ) {
        return this.blogsService.unpublishBlog(blogID, req.user.sub);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteBlog(
        @Param('id', ParseUUIDPipe) blogID: string,
        @Request() req: { user: JwtPayload },
    ) {
        return this.blogsService.deleteBlog(blogID, req.user.sub);
    }
}
