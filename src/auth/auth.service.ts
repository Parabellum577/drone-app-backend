import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UpdateUserProfileDto } from '../users/dto/update-user-profile.dto';
import { PasswordService } from './password.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  PaginationParams,
  PaginatedResponse,
} from '../common/interfaces/pagination.interface';

interface UserObject {
  _id: Types.ObjectId;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  followersCount: number;
  followingCount: number;
  createdAt?: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  private mapUserToResponse(user: UserDocument): UserResponseDto {
    const result = user.toObject() as UserObject;
    return {
      id: result._id.toString(),
      email: result.email,
      username: result.username,
      fullName: result.fullName ?? '',
      avatar: result.avatar ?? '',
      bio: result.bio ?? '',
      location: result.location ?? '',
      followers: (result.followers ?? []).map((id: Types.ObjectId) =>
        id.toString(),
      ),
      following: (result.following ?? []).map((id: Types.ObjectId) =>
        id.toString(),
      ),
      followersCount: result.followersCount ?? 0,
      followingCount: result.followingCount ?? 0,
      createdAt: result.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.mapUserToResponse(user);
  }

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.mapUserToResponse(user);
  }

  login(user: UserResponseDto): AuthResponseDto {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.mapUserToResponse(user);
  }

  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.mapUserToResponse(user);
  }

  async findAll(
    filters?: {
      searchParam?: string;
      location?: string;
      excludeUserId?: string;
    },
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const query: Record<string, any> = {};

    if (filters?.searchParam) {
      query.$or = [
        { username: { $regex: filters.searchParam, $options: 'i' } },
        { fullName: { $regex: filters.searchParam, $options: 'i' } },
      ];
    }

    if (filters?.location) {
      const locationParts = filters.location
        .split(',')
        .map((part) => part.trim());
      query.$or = [
        { location: { $regex: filters.location, $options: 'i' } },
        ...locationParts.map((part) => ({
          location: { $regex: part, $options: 'i' },
        })),
      ];
    }

    if (filters?.excludeUserId) {
      query._id = { $ne: new Types.ObjectId(filters.excludeUserId) };
    }

    const limit = pagination?.limit ?? 10;
    const offset = pagination?.offset ?? 0;

    const [items, total] = await Promise.all([
      this.userModel.find(query).skip(offset).limit(limit).exec(),
      this.userModel.countDocuments(query),
    ]);

    return {
      items: items.map((user) => this.mapUserToResponse(user)),
      total,
      limit,
      offset,
    };
  }
}
