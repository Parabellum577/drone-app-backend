import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { FollowResponseDto } from './dto/follow-response.dto';

interface RequestWithUser extends Request {
  user: { id: string };
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users except current user' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  @ApiQuery({
    name: 'searchParam',
    required: false,
    description: 'Search users by username or full name (case-insensitive)',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter users by location (case-insensitive)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(
    @Request() req: RequestWithUser,
    @Query('searchParam') searchParam?: string,
    @Query('location') location?: string,
  ): Promise<UserResponseDto[]> {
    const filters = { searchParam, location };
    const users = await this.usersService.findAll(filters);
    return users
      .filter((user) => user._id.toString() !== req.user.id)
      .map((user) => this.usersService.mapUserToResponse(user));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    type: UserResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUserProfile(
    @Request() req: RequestWithUser,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserProfile(req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated',
    type: UserResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateData: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(req.user.id, updateData);
  }

  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':userId')
  async getUserProfile(
    @Param('userId') userId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserProfile(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recalculate followers/following counters' })
  @ApiResponse({
    status: 200,
    description: 'Counters recalculated successfully',
  })
  @Post('recalculate-counters')
  async recalculateCounters(): Promise<{ message: string }> {
    await this.usersService.recalculateCounters();
    return { message: 'Counters recalculated successfully' };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully followed user',
    type: FollowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Param('id') userId: string,
    @Request() req: { user: { id: string } },
  ): Promise<FollowResponseDto> {
    return this.usersService.followUser(userId, req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully unfollowed user',
    type: FollowResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id/unfollow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('id') userId: string,
    @Request() req: { user: { id: string } },
  ): Promise<FollowResponseDto> {
    return this.usersService.unfollowUser(userId, req.user.id);
  }
}
