import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: false,
  })
  email?: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  username?: string;

  @ApiProperty({
    description: 'Full name of the user',
    required: false,
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  fullName?: string;

  @ApiProperty({
    description: 'URL to user avatar',
    required: false,
    example: 'https://example.com/avatar.jpg',
  })
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'User bio/description',
    required: false,
    example: 'Software developer from San Francisco',
  })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  bio?: string;

  @ApiProperty({
    description: 'User location',
    required: false,
    example: 'San Francisco, CA',
  })
  @IsString()
  @IsOptional()
  @MaxLength(70)
  location?: string;
}
