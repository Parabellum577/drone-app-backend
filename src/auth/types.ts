import { Types } from 'mongoose';
import { UserDocument as BaseUserDocument } from '../users/user.schema';

export interface UserDocument extends BaseUserDocument {
  toObject(): {
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
    createdAt: Date;
    password: string;
  };
}
