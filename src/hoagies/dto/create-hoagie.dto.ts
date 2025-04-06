import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsUrl,
  IsMongoId,
} from 'class-validator';

export class CreateHoagieDto {
  @ApiProperty({
    description: 'The name of the hoagie',
    example: 'Italian Hoagie',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'List of ingredients in the hoagie',
    example: ['Ham', 'Provolone', 'Lettuce', 'Tomato', 'Onion'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients: string[];

  @ApiProperty({
    description: 'URL to a picture of the hoagie',
    example: 'https://example.com/images/italian-hoagie.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  picture?: string;

  @ApiProperty({
    description: 'ID of the user creating the hoagie',
    example: '64a1b2c3d4e5f6g7h8i9j0k2',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
