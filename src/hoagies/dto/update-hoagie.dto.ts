import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CreateHoagieDto } from './create-hoagie.dto';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateHoagieDto extends PartialType(
  OmitType(CreateHoagieDto, ['userId']),
) {
  @ApiProperty({
    description: 'The name of the hoagie',
    example: 'Updated Italian Hoagie',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'List of ingredients in the hoagie',
    example: ['Ham', 'Provolone', 'Lettuce', 'Tomato', 'Onion'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiProperty({
    description: 'URL to a picture of the hoagie',
    example: 'https://example.com/images/italian-hoagie.jpg',
    required: false,
  })
  picture?: string;
}
