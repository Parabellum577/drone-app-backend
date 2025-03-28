import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { PasswordService } from '../auth/password.service';
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
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly passwordService: PasswordService,
  ) {}

  mapUserToResponse(user: UserDocument): UserResponseDto {
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

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const hashedPassword = await this.passwordService.hash(
        createUserDto.password,
      );

      const userData = {
        ...createUserDto,
        password: hashedPassword,
        followers: new Array<Types.ObjectId>(0),
        following: new Array<Types.ObjectId>(0),
        followersCount: 0,
        followingCount: 0,
      };
      const user = await this.userModel.create(userData);
      return this.mapUserToResponse(user);
    } catch (error: unknown) {
      console.error('[Users] Create user error:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserToResponse(user);
  }

  async updateProfile(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserResponseDto> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateData.username) {
      const userWithSameUsername = await this.userModel
        .findOne({
          username: updateData.username,
          _id: { $ne: new Types.ObjectId(userId) },
        })
        .exec();

      if (userWithSameUsername) {
        throw new BadRequestException('Username is already taken');
      }
      user.username = updateData.username;
    }

    if (updateData.fullName !== undefined) user.fullName = updateData.fullName;
    if (updateData.avatar !== undefined) user.avatar = updateData.avatar;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (updateData.location !== undefined) user.location = updateData.location;

    const updatedUser = await user.save();

    return this.mapUserToResponse(updatedUser);
  }

  async findAll(
    filters?: {
      searchParam?: string;
      location?: string;
      excludeUserId?: string;
    },
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<UserDocument>> {
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
      items,
      total,
      limit,
      offset,
    };
  }

  async update(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
  }

  async recalculateCounters(): Promise<void> {
    const users = await this.userModel.find().exec();

    await Promise.all(
      users.map(async (user) => {
        user.followersCount = user.followers.length;
        user.followingCount = user.following.length;
        await user.save();
      }),
    );
  }

  async followUser(
    userId: string,
    followerId: string,
  ): Promise<FollowResponseDto> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const follower = await this.findById(followerId);
    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    if (userId === followerId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    if (user.followers.includes(new Types.ObjectId(followerId))) {
      throw new BadRequestException('Already following this user');
    }

    user.followers.push(new Types.ObjectId(followerId));
    user.followersCount = user.followers.length;

    follower.following.push(new Types.ObjectId(userId));
    follower.followingCount = follower.following.length;

    const [updatedUser, updatedFollower] = await Promise.all([
      user.save(),
      follower.save(),
    ]);

    return {
      userId: updatedUser._id.toString(),
      followerId: updatedFollower._id.toString(),
      isFollowing: true,
      followersCount: updatedUser.followersCount,
      followingCount: updatedFollower.followingCount,
    };
  }

  async unfollowUser(
    userId: string,
    followerId: string,
  ): Promise<FollowResponseDto> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const follower = await this.findById(followerId);
    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    if (userId === followerId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    const followerObjectId = new Types.ObjectId(followerId);
    const userObjectId = new Types.ObjectId(userId);

    if (!user.followers.some((id) => id.equals(followerObjectId))) {
      throw new BadRequestException('Not following this user');
    }

    user.followers = user.followers.filter(
      (id) => !id.equals(followerObjectId),
    );
    user.followersCount = user.followers.length;

    follower.following = follower.following.filter(
      (id) => !id.equals(userObjectId),
    );
    follower.followingCount = follower.following.length;

    const [updatedUser, updatedFollower] = await Promise.all([
      user.save(),
      follower.save(),
    ]);

    return {
      userId: updatedUser._id.toString(),
      followerId: updatedFollower._id.toString(),
      isFollowing: false,
      followersCount: updatedUser.followersCount,
      followingCount: updatedFollower.followingCount,
    };
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !user;
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return !user;
  }

  async checkLocations(): Promise<void> {
    const users = await this.userModel
      .find()
      .select('username location')
      .exec();
    console.log(
      'All users with locations:',
      users.map((u) => ({ username: u.username, location: u.location })),
    );
  }
}
