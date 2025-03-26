import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Service title',
    example: 'Event Aerial Photography',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional drone photography for your events',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Service price',
    example: 60,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Service currency',
    enum: ['EUR', 'USD', 'PLN'],
    example: 'EUR',
  })
  @IsEnum(['EUR', 'USD', 'PLN'])
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'URL to service image',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({
    description: 'Service location',
    example: 'Warsaw, Poland',
  })
  @IsString()
  @IsNotEmpty()
  location: string;
}
