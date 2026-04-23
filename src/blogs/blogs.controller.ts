import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) {}

    @Get()
    getAllBlogs() {
        return this.blogsService.getAllBlogs();
    }

    // Static segments must come before param segments to avoid route collision
    @Get('published')
    getPublishedBlogs() {
        return this.blogsService.getPublishedBlogs();
    }

    @Get('author/:authorID')
    getBlogsByAuthor(@Param('authorID') authorID: string) {
        return this.blogsService.getBlogsByAuthor(authorID);
    }

    @Get(':id')
    getBlogById(@Param('id') blogID: string) {
        return this.blogsService.getBlogById(blogID);
    }

    // Blog-owned tag sub-routes: the resource in the URL is a blog, so these belong here
    @Get(':id/tags')
    getBlogTags(@Param('id') blogID: string) {
        return this.blogsService.getBlogTags(blogID);
    }

    @Post(':id/tags/:tagId')
    addTagToBlog(@Param('id') blogID: string, @Param('tagId') tagID: string) {
        return this.blogsService.addTagToBlog(blogID, tagID);
    }

    @Delete(':id/tags/:tagId')
    removeTagFromBlog(
        @Param('id') blogID: string,
        @Param('tagId') tagID: string,
    ) {
        return this.blogsService.removeTagFromBlog(blogID, tagID);
    }

    // Blog-owned comment sub-routes
    @Get(':id/comments')
    getBlogComments(@Param('id') blogID: string) {
        return this.blogsService.getBlogComments(blogID);
    }

    @Post()
    createBlog(@Body() createBlogDto: CreateBlogDto) {
        return this.blogsService.createBlog(createBlogDto);
    }

    @Patch(':id')
    updateBlog(
        @Param('id') blogID: string,
        @Body() updateBlogDto: UpdateBlogDto,
    ) {
        return this.blogsService.updateBlog(blogID, updateBlogDto);
    }

    @Patch(':id/publish')
    publishBlog(
        @Param('id') blogID: string,
        @Body('authorID') authorID: string,
    ) {
        return this.blogsService.publishBlog(blogID, authorID);
    }

    @Patch(':id/unpublish')
    unpublishBlog(
        @Param('id') blogID: string,
        @Body('authorID') authorID: string,
    ) {
        return this.blogsService.unpublishBlog(blogID, authorID);
    }

    @Delete(':id')
    deleteBlog(
        @Param('id') blogID: string,
        @Body('authorID') authorID: string,
    ) {
        return this.blogsService.deleteBlog(blogID, authorID);
    }
}
