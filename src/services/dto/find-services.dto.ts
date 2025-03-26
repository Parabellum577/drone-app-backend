import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FindServicesDto {
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
}
