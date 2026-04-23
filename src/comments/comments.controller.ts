import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get()
    getAllComments() {
        return this.commentsService.getAllComments();
    }

    @Get(':id')
    getCommentById(@Param('id') id: string) {
        return this.commentsService.getCommentById(id);
    }

    @Post()
    createComment(@Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.createComment(createCommentDto);
    }

    @Patch(':id')
    updateComment(
        @Param('id') id: string,
        @Body() updateCommentDto: UpdateCommentDto,
        @Body('authorID') authorID: string,
    ) {
        return this.commentsService.updateComment(
            id,
            updateCommentDto,
            authorID,
        );
    }

    @Delete(':id')
    deleteComment(@Param('id') id: string, @Body('authorID') authorID: string) {
        return this.commentsService.deleteComment(id, authorID);
    }
}
