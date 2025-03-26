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
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserToResponse(user);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async update(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
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

    const [updatedUser, updatedFollower] = (await Promise.all([
      user.save(),
      follower.save(),
    ])) as [UserDocument, UserDocument];

    return {
      userId: updatedUser.id,
      followerId: updatedFollower.id,
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

    const [updatedUser, updatedFollower] = (await Promise.all([
      user.save(),
      follower.save(),
    ])) as [UserDocument, UserDocument];

    return {
      userId: updatedUser.id,
      followerId: updatedFollower.id,
      isFollowing: false,
      followersCount: updatedUser.followersCount,
      followingCount: updatedFollower.followingCount,
    };
  }
}
