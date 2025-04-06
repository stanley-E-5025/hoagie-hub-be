import { ApiProperty } from '@nestjs/swagger';
import { User } from '../schemas/user.schema';

export class UserResponseDto {
  @ApiProperty({
    example: '64a1b2c3d4e5f6g7h8i9j0k1',
    description: 'User ID',
  })
  _id: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
  })
  name: string;

  @ApiProperty({
    example: '2023-04-05T12:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-04-05T12:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Array of users',
  })
  data: User[];

  @ApiProperty({
    example: 20,
    description: 'Total number of users',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  limit: number;
}
