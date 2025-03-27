import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ServiceCategory } from './enums/service-category.enum';
import { DayOfWeek } from './enums/day-of-week.enum';
import { WorkingHours } from './interfaces/working-hours.interface';

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
  category: ServiceCategory;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  availableDays?: DayOfWeek[];
  workingHours?: WorkingHours;
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

  @Prop({
    required: true,
    enum: Object.values(ServiceCategory),
    default: ServiceCategory.SERVICE,
  })
  category: ServiceCategory;

  // EVENT
  @Prop({ type: Date, required: false })
  startDate: Date;

  @Prop({ type: Date, required: false })
  endDate: Date;

  @Prop({ required: false })
  startTime: string;

  @Prop({ required: false })
  endTime: string;

  // SERVICE
  @Prop({ type: [String], enum: Object.values(DayOfWeek), required: false })
  availableDays: DayOfWeek[];

  @Prop({ type: Object, required: false })
  workingHours: WorkingHours;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
