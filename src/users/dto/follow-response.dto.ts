import { ApiProperty } from '@nestjs/swagger';

export class FollowResponseDto {
  @ApiProperty({
    description: 'ID of the user being followed/unfollowed',
  })
  userId: string;

  @ApiProperty({
    description: 'ID of the user who is following/unfollowing',
  })
  followerId: string;

  @ApiProperty({
    description: 'Whether the user is now being followed',
    example: true,
  })
  isFollowing: boolean;

  @ApiProperty({
    description: 'Updated number of followers for the target user',
  })
  followersCount: number;

  @ApiProperty({
    description: 'Updated number of users being followed by the follower',
  })
  followingCount: number;
}
