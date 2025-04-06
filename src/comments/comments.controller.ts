import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  Inject,
  forwardRef,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService, PaginatedCommentsResult } from './comments.service';
import { CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle, SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { HoagiesService } from '../hoagies/hoagies.service';

@ApiTags('comments')
@Controller('comments')
@SkipThrottle()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    @Inject(forwardRef(() => HoagiesService))
    private readonly hoagiesService: HoagiesService,
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ commentCreation: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
  })
  async create(
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentDocument> {
    const comment = await this.commentsService.create(createCommentDto);
    await this.hoagiesService.incrementCommentCount(createCommentDto.hoagieId);
    return comment;
  }

  @Get('hoagie/:hoagieId')
  @ApiOperation({
    summary: 'Get all comments for a specific hoagie with pagination',
  })
  @ApiParam({ name: 'hoagieId', description: 'ID of the hoagie' })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: Number,
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    type: Number,
    required: false,
    example: 10,
  })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Hoagie not found' })
  async findAllByHoagie(
    @Param('hoagieId') hoagieId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedCommentsResult> {
    limit = limit > 100 ? 100 : limit;
    return this.commentsService.findAllByHoagieId(hoagieId, page, limit);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'ID of the comment to delete' })
  @ApiBody({
    schema: {
      properties: {
        userId: { type: 'string', example: '64a1b2c3d4e5f6g7h8i9j0k2' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized - only the comment author can delete it',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async delete(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<CommentDocument> {
    const comment = await this.commentsService.delete(id, userId);
    await this.hoagiesService.decrementCommentCount(comment.hoagie.toString());
    return comment;
  }
}
