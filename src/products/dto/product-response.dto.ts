import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '../enums/product-category.enum';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Unique product identifier',
    example: 'product_1234567890',
  })
  productId: string;

  @ApiProperty({
    description: 'Product title',
    example: 'DJI Mini 3 Pro',
  })
  title: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Lightweight and portable drone with 4K camera',
  })
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 999,
  })
  price: number;

  @ApiProperty({
    description: 'Product currency',
    enum: ['EUR', 'USD', 'PLN'],
    example: 'EUR',
  })
  currency: string;

  @ApiProperty({
    description: 'URLs to product images',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  images: string[];

  @ApiProperty({
    description: 'Product category',
    enum: ProductCategory,
    example: ProductCategory.DRONE,
  })
  category: ProductCategory;

  @ApiProperty({
    description: 'ID of user who created the product',
    example: '507f1f77bcf86cd799439011',
  })
  created_by: string;

  @ApiProperty({
    description: 'Product creation date',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Product last update date',
  })
  updatedAt: string;
}
