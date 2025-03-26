import { IsString, IsEmail, MinLength, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'username123', description: 'Username' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User location',
    example: 'Warsaw, Poland',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    required: false,
    example: 'John Doe',
    description: 'Full name',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    required: false,
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
