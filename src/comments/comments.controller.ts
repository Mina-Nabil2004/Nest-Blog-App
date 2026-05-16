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

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get()
    getAllComments() {
        return this.commentsService.getAllComments();
    }

    @Get(':id')
    getCommentById(@Param('id', ParseUUIDPipe) id: string) {
        return this.commentsService.getCommentById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    createComment(
        @Request() req: { user: JwtPayload },
        @Body() createCommentDto: CreateCommentDto,
    ) {
        return this.commentsService.createComment(
            req.user.sub,
            createCommentDto,
        );
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    updateComment(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCommentDto: UpdateCommentDto,
        @Request() req: { user: JwtPayload },
    ) {
        return this.commentsService.updateComment(
            id,
            updateCommentDto,
            req.user.sub,
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteComment(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: { user: JwtPayload },
    ) {
        return this.commentsService.deleteComment(id, req.user.sub);
    }
}
