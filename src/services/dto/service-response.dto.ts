import { ApiProperty } from '@nestjs/swagger';

export class ServiceResponseDto {
  @ApiProperty({
    description: 'Service ID',
  })
  id: string;

  @ApiProperty({
    description: 'Unique service identifier',
    example: 'service_1234567890',
  })
  serviceId: string;

  @ApiProperty({
    description: 'Service title',
    example: 'Event Aerial Photography',
  })
  title: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional drone photography for your events',
  })
  description: string;

  @ApiProperty({
    description: 'Service price',
    example: '60',
  })
  price: string;

  @ApiProperty({
    description: 'Service currency',
    enum: ['EUR', 'USD', 'PLN'],
    example: 'EUR',
  })
  currency: string;

  @ApiProperty({
    description: 'Service location',
    example: 'Warsaw, Poland',
  })
  location: string;

  @ApiProperty({
    description: 'ID of user who created the service',
    example: '507f1f77bcf86cd799439011',
  })
  created_by: string;

  @ApiProperty({
    description: 'URL to service image',
    example: 'https://example.com/image.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'Service creation date',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Service last update date',
  })
  updatedAt: string;
}
