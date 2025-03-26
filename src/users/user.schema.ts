import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  password: string;
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

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  fullName?: string;

  @Prop()
  avatar?: string;

  @Prop()
  bio?: string;

  @Prop()
  location?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  following: Types.ObjectId[];

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ default: 0 })
  followingCount: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
