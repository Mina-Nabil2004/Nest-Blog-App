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
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';
import { blogImageMulterConfig } from '@/common/config/multer.config';

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
    @UseInterceptors(FileInterceptor('image', blogImageMulterConfig))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data', 'application/json')
    createBlog(
        @Request() req: { user: JwtPayload },
        @Body() createBlogDto: CreateBlogDto,
        @UploadedFile(new ImageValidationPipe(false))
        image?: Express.Multer.File,
    ) {
        return this.blogsService.createBlog(req.user.sub, createBlogDto, image);
    }

    @Post(':id/image')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image', blogImageMulterConfig))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    uploadBlogImage(
        @Request() req: { user: JwtPayload },
        @Param('id', ParseUUIDPipe) blogID: string,
        @UploadedFile(new ImageValidationPipe(true))
        image: Express.Multer.File,
    ) {
        return this.blogsService.uploadBlogImage(req.user.sub, blogID, image);
    }

    @Post(':id/tags/:tagId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    addTagToBlog(
        @Param('id', ParseUUIDPipe) blogID: string,
        @Param('tagId', ParseUUIDPipe) tagID: string,
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
    @UseInterceptors(FileInterceptor('image', blogImageMulterConfig))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data', 'application/json')
    updateBlog(
        @Request() req: { user: JwtPayload },
        @Param('id', ParseUUIDPipe) blogID: string,
        @Body() updateBlogDto: UpdateBlogDto,
        @UploadedFile(new ImageValidationPipe(false))
        image?: Express.Multer.File,
    ) {
        return this.blogsService.updateBlog(
            req.user.sub,
            blogID,
            updateBlogDto,
            image,
        );
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
