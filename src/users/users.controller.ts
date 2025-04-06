import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService, PaginatedUsersResult } from './users.service';
import { UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import {
  PaginatedUsersResponseDto,
  UserResponseDto,
} from './dto/paginated-users-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('users')
@Controller('users')
@SkipThrottle()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
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
  @ApiResponse({
    status: 200,
    description: 'Returns paginated users',
    type: PaginatedUsersResponseDto,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedUsersResult> {
    limit = limit > 100 ? 100 : limit;
    return this.usersService.findAllPaginated(page, limit);
  }

  @Get('search')
  @UseGuards(ThrottlerGuard)
  @Throttle({ userSearch: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    type: String,
    required: true,
  })
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
  @ApiResponse({
    status: 200,
    description: 'Returns paginated search results',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
  })
  async searchUsers(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedUsersResult> {
    limit = limit > 100 ? 100 : limit;
    return this.usersService.searchUsers(query, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserDocument> {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ userCreation: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
  })
  async login(@Body() loginUserDto: LoginUserDto): Promise<UserDocument> {
    return this.usersService.login(loginUserDto);
  }
}
