import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The comment text',
    example: 'This is a great hoagie!',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'ID of the hoagie being commented on',
    example: '64a1b2c3d4e5f6g7h8i9j0k1',
  })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  hoagieId: string;

  @ApiProperty({
    description: 'ID of the user making the comment',
    example: '64a1b2c3d4e5f6g7h8i9j0k2',
  })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
