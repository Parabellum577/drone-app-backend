import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  location: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  followersCount: number;
  followingCount: number;
  createdAt: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  fullName?: string;

  @Prop()
  avatar?: string;

  @Prop()
  bio?: string;

  @Prop({ type: [Types.ObjectId], default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  following: Types.ObjectId[];

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ default: 0 })
  followingCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  if (this.followers) {
    this.followersCount = this.followers.length;
  }
  if (this.following) {
    this.followingCount = this.following.length;
  }
  next();
});
