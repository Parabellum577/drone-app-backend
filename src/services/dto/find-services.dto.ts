import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Min,
  Max,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCategory } from '../enums/service-category.enum';
import { PaginationParams } from '../../common/interfaces/pagination.interface';

export class FindServicesDto implements PaginationParams {
  @ApiProperty({
    description: 'Search by title',
    required: false,
    example: 'drone',
  })
  @IsOptional()
  @IsString()
  searchTitle?: string;

  @ApiProperty({
    description: 'Filter by location',
    required: false,
    example: 'Warsaw',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Minimum price',
    required: false,
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price',
    required: false,
    example: 200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(1000000)
  maxPrice?: number;

  @ApiProperty({
    description: 'Filter by category',
    required: false,
    enum: ServiceCategory,
    example: ServiceCategory.SERVICE,
  })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Number of items to skip',
    minimum: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
