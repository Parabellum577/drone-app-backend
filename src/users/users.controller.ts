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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponse, UpdateUserProfileDto } from '../auth/types';

interface RequestWithUser extends Request {
  user: { id: string };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async getUsers(): Promise<UserResponse[]> {
    return this.usersService
      .findAll()
      .then((users) =>
        users.map((user) => this.usersService.mapUserToResponse(user)),
      );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUserProfile(
    @Request() req: RequestWithUser,
  ): Promise<UserResponse> {
    return this.usersService.getUserProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateData: UpdateUserProfileDto,
  ): Promise<UserResponse> {
    return this.usersService.updateProfile(req.user.id, updateData);
  }

  @Get(':userId')
  async getUserProfile(@Param('userId') userId: string): Promise<UserResponse> {
    return this.usersService.getUserProfile(userId);
  }

  @Put(':userId')
  async updateUserProfile(
    @Param('userId') userId: string,
    @Body() updateData: UpdateUserProfileDto,
  ): Promise<UserResponse> {
    return this.usersService.updateProfile(userId, updateData);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Param('id') userId: string,
    @Request() req: { user: { id: string } },
  ): Promise<{ user: UserResponse; follower: UserResponse }> {
    return this.usersService.followUser(userId, req.user.id);
  }

  @Delete(':id/unfollow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('id') userId: string,
    @Request() req: { user: { id: string } },
  ): Promise<{ user: UserResponse; follower: UserResponse }> {
    return this.usersService.unfollowUser(userId, req.user.id);
  }
}
