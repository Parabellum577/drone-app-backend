import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsArray,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { ProductCategory } from '../enums/product-category.enum';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    example: 'DJI Mini 3 Pro',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Lightweight and portable drone with 4K camera',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 999,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Product currency',
    enum: ['EUR', 'USD', 'PLN'],
    example: 'EUR',
  })
  @IsEnum(['EUR', 'USD', 'PLN'])
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'URLs to product images',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty()
  images: string[];

  @ApiProperty({
    description: 'Product category',
    enum: ProductCategory,
    example: ProductCategory.DRONE,
    default: ProductCategory.DRONE,
  })
  @IsEnum(ProductCategory)
  @IsNotEmpty()
  category: ProductCategory;
}
