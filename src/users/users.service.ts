import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponse } from '../auth/types';

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
  ) {}

  mapUserToResponse(user: UserDocument): UserResponse {
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

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
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
    } catch (error) {
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

  async getUserProfile(userId: string): Promise<UserResponse> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapUserToResponse(user);
  }

  async updateProfile(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UserResponse> {
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
  ): Promise<{ user: UserResponse; follower: UserResponse }> {
    const user = await this.userModel.findById(userId);
    const follower = await this.userModel.findById(followerId);

    if (!user || !follower) {
      throw new NotFoundException('User not found');
    }

    const followerObjectId = new Types.ObjectId(followerId);
    const userObjectId = new Types.ObjectId(userId);

    // Check if already following
    if (user.followers?.some((id) => id.equals(followerObjectId))) {
      return {
        user: this.mapUserToResponse(user),
        follower: this.mapUserToResponse(follower),
      };
    }

    // Ensure followers and following are arrays
    await Promise.all([
      this.userModel.updateOne(
        { _id: userId },
        {
          $set: {
            followers: Array.isArray(user.followers) ? user.followers : [],
          },
        },
      ),
      this.userModel.updateOne(
        { _id: followerId },
        {
          $set: {
            following: Array.isArray(follower.following)
              ? follower.following
              : [],
          },
        },
      ),
    ]);

    // Add followers/following
    await Promise.all([
      this.userModel.updateOne(
        { _id: userId },
        {
          $push: { followers: followerObjectId },
          $inc: { followersCount: 1 },
        },
      ),
      this.userModel.updateOne(
        { _id: followerId },
        {
          $push: { following: userObjectId },
          $inc: { followingCount: 1 },
        },
      ),
    ]);

    // Get updated data for both users
    const [updatedUser, updatedFollower] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserProfile(followerId),
    ]);

    return {
      user: updatedUser,
      follower: updatedFollower,
    };
  }

  async unfollowUser(
    userId: string,
    followerId: string,
  ): Promise<{ user: UserResponse; follower: UserResponse }> {
    const user = await this.userModel.findById(userId);
    const follower = await this.userModel.findById(followerId);

    if (!user || !follower) {
      throw new NotFoundException('User not found');
    }

    const followerObjectId = new Types.ObjectId(followerId);
    const userObjectId = new Types.ObjectId(userId);

    // Ensure followers and following are arrays
    await Promise.all([
      this.userModel.updateOne(
        { _id: userId },
        {
          $set: {
            followers: Array.isArray(user.followers) ? user.followers : [],
          },
        },
      ),
      this.userModel.updateOne(
        { _id: followerId },
        {
          $set: {
            following: Array.isArray(follower.following)
              ? follower.following
              : [],
          },
        },
      ),
    ]);

    // Check if not following
    if (!user.followers?.some((id) => id.equals(followerObjectId))) {
      return {
        user: this.mapUserToResponse(user),
        follower: this.mapUserToResponse(follower),
      };
    }

    // Remove followers/following
    await Promise.all([
      this.userModel.updateOne(
        { _id: userId },
        {
          $pull: { followers: followerObjectId },
          $inc: { followersCount: -1 },
        },
      ),
      this.userModel.updateOne(
        { _id: followerId },
        {
          $pull: { following: userObjectId },
          $inc: { followingCount: -1 },
        },
      ),
    ]);

    // Get updated data for both users
    const [updatedUser, updatedFollower] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserProfile(followerId),
    ]);

    return {
      user: updatedUser,
      follower: updatedFollower,
    };
  }
}
