import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponse, UpdateUserProfileDto, UserDocument } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private mapUserToResponse(user: UserDocument): UserResponse {
    const result = user.toObject();
    return {
      id: result._id.toString(),
      email: result.email,
      username: result.username,
      fullName: result.fullName ?? '',
      avatar: result.avatar ?? '',
      bio: result.bio ?? '',
      location: result.location ?? '',
      followers: (result.followers ?? []).map((id) => id.toString()),
      following: (result.following ?? []).map((id) => id.toString()),
      followersCount: result.followersCount ?? 0,
      followingCount: result.followingCount ?? 0,
      createdAt: result.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return this.mapUserToResponse(user);
      }
    }
    return null;
  }

  login(user: UserResponse) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.usersService.findByEmail(
        createUserDto.email,
      );
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const user = await this.usersService.create(createUserDto);
      return this.login(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('[Auth] Registration error:', error);
      throw new UnauthorizedException('Registration failed');
    }
  }

  async getUserProfile(userId: string): Promise<UserResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.mapUserToResponse(user);
  }

  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<UserResponse> {
    const user = await this.usersService.update(userId, updateData);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.mapUserToResponse(user);
  }

  async getUsers(): Promise<UserResponse[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => this.mapUserToResponse(user));
  }
}
