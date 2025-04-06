import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  Request,
  BadRequestException,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { HoagiesService, PaginatedHoagiesResult } from './hoagies.service';
import { CreateHoagieDto } from './dto/create-hoagie.dto';
import { UpdateHoagieDto } from './dto/update-hoagie.dto';
import { HoagieDocument } from './schemas/hoagie.schema';
import { UsersService } from '../users/users.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle, SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';

@ApiTags('hoagies')
@Controller('hoagies')
@SkipThrottle()
export class HoagiesController {
  constructor(
    private readonly hoagiesService: HoagiesService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ hoagieCreation: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new hoagie' })
  @ApiBody({ type: CreateHoagieDto })
  @ApiResponse({ status: 201, description: 'Hoagie created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
  })
  async create(
    @Body() createHoagieDto: CreateHoagieDto,
  ): Promise<HoagieDocument> {
    try {
      const user = await this.usersService.findById(createHoagieDto.userId);
      return this.hoagiesService.create(createHoagieDto, user);
    } catch (error) {
      throw new BadRequestException('Invalid user ID provided');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all hoagies with pagination' })
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
  @ApiResponse({ status: 200, description: 'Returns paginated hoagies' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedHoagiesResult> {
    limit = limit > 100 ? 100 : limit;
    return this.hoagiesService.findAllPaginated(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hoagie by ID' })
  @ApiParam({ name: 'id', description: 'Hoagie ID' })
  @ApiResponse({ status: 200, description: 'Hoagie found successfully' })
  @ApiResponse({ status: 404, description: 'Hoagie not found' })
  async findOne(@Param('id') id: string): Promise<HoagieDocument> {
    return this.hoagiesService.findOneById(id);
  }

  @Get(':id/comment-count')
  @ApiOperation({ summary: 'Get the comment count for a hoagie' })
  @ApiParam({ name: 'id', description: 'Hoagie ID' })
  @ApiResponse({
    status: 200,
    description: 'Comment count retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Hoagie not found' })
  async getCommentCount(@Param('id') id: string): Promise<{ count: number }> {
    const hoagie = await this.hoagiesService.findOneById(id);
    return { count: hoagie.commentCount };
  }

  @Post(':hoagieId/collaborators/:collaboratorId/user/:userId')
  @ApiOperation({ summary: 'Add a collaborator to a hoagie' })
  @ApiParam({ name: 'hoagieId', description: 'ID of the hoagie' })
  @ApiParam({
    name: 'collaboratorId',
    description: 'ID of the user to add as collaborator',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user performing the action',
  })
  @ApiResponse({ status: 200, description: 'Collaborator added successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the creator can add collaborators',
  })
  @ApiResponse({ status: 404, description: 'Hoagie or user not found' })
  async addCollaborator(
    @Param('hoagieId') hoagieId: string,
    @Param('collaboratorId') collaboratorId: string,
    @Param('userId') userId: string,
  ): Promise<HoagieDocument> {
    try {
      await this.usersService.findById(userId);

      return this.hoagiesService.addCollaborator(
        hoagieId,
        collaboratorId,
        userId,
      );
    } catch (error) {
      if (error.name === 'NotFoundException') {
        throw new BadRequestException('Invalid user ID provided');
      }
      throw error;
    }
  }

  @Patch(':id/user/:userId')
  @UseGuards(ThrottlerGuard)
  @Throttle({ hoagieUpdate: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Update a hoagie' })
  @ApiParam({ name: 'id', description: 'Hoagie ID' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user performing the update',
  })
  @ApiBody({ type: UpdateHoagieDto })
  @ApiResponse({ status: 200, description: 'Hoagie updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update',
  })
  @ApiResponse({ status: 404, description: 'Hoagie not found' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
  })
  async update(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateHoagieDto: UpdateHoagieDto,
  ): Promise<HoagieDocument> {
    try {
      await this.usersService.findById(userId);

      return this.hoagiesService.updateHoagie(id, updateHoagieDto, userId);
    } catch (error) {
      if (error.name === 'NotFoundException') {
        throw new BadRequestException('Invalid user ID provided');
      }
      throw error;
    }
  }

  @Delete(':hoagieId/collaborators/:collaboratorId/user/:userId')
  @ApiOperation({ summary: 'Remove a collaborator from a hoagie' })
  @ApiParam({ name: 'hoagieId', description: 'ID of the hoagie' })
  @ApiParam({
    name: 'collaboratorId',
    description: 'ID of the collaborator to remove',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user performing the action',
  })
  @ApiResponse({
    status: 200,
    description: 'Collaborator removed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only creator can remove collaborators',
  })
  @ApiResponse({ status: 404, description: 'Hoagie or user not found' })
  async removeCollaborator(
    @Param('hoagieId') hoagieId: string,
    @Param('collaboratorId') collaboratorId: string,
    @Param('userId') userId: string,
  ): Promise<HoagieDocument> {
    try {
      await this.usersService.findById(userId);

      return this.hoagiesService.removeCollaborator(
        hoagieId,
        collaboratorId,
        userId,
      );
    } catch (error) {
      if (error.name === 'NotFoundException') {
        throw new BadRequestException('Invalid user ID provided');
      }
      throw error;
    }
  }

  @Post('admin/recalculate-comment-counts')
  @ApiOperation({ summary: 'Admin endpoint to recalculate all comment counts' })
  @ApiResponse({
    status: 200,
    description: 'Comment counts recalculated successfully',
  })
  async recalculateAllCommentCounts(): Promise<{ message: string }> {
    await this.hoagiesService.recalculateAllCommentCounts();
    return { message: 'All comment counts recalculated successfully' };
  }
}
