import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
