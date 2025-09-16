import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductCategory } from './enums/product-category.enum';

export interface ProductDocument extends Document {
  _id: Types.ObjectId;
  productId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: ProductCategory;
  createdAt: Date;
  updatedAt: Date;
  created_by: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  productId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, enum: ['EUR', 'USD', 'PLN'] })
  currency: string;

  @Prop({ required: true, type: [String] })
  images: string[];

  @Prop({
    required: true,
    enum: Object.values(ProductCategory),
    default: ProductCategory.DRONE,
  })
  category: ProductCategory;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
