import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface ServiceDocument extends Document {
  _id: Types.ObjectId;
  serviceId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  created_by: Types.ObjectId;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  location: string;
}

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, unique: true })
  serviceId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, enum: ['EUR', 'USD', 'PLN'] })
  currency: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by: Types.ObjectId;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  location: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
