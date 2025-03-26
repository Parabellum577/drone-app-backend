import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'Unique user identifier' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Full name of the user', required: false })
  fullName: string;

  @ApiProperty({ description: 'URL to user avatar', required: false })
  avatar: string;

  @ApiProperty({ description: 'User bio/description', required: false })
  bio: string;

  @ApiProperty({ description: 'User location', required: false })
  location: string;

  @ApiProperty({ description: 'Array of follower IDs', type: [String] })
  followers: string[];

  @ApiProperty({ description: 'Array of following user IDs', type: [String] })
  following: string[];

  @ApiProperty({ description: 'Number of followers' })
  followersCount: number;

  @ApiProperty({ description: 'Number of users being followed' })
  followingCount: number;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: string;
}
