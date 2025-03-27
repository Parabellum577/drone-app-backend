import { ApiProperty } from '@nestjs/swagger';
import { ServiceCategory } from '../enums/service-category.enum';
import { DayOfWeek } from '../enums/day-of-week.enum';
import { WorkingHours } from '../interfaces/working-hours.interface';

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
    example: 60,
  })
  price: number;

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
    description: 'Service category',
    enum: ServiceCategory,
    example: ServiceCategory.SERVICE,
  })
  category: ServiceCategory;

  @ApiProperty({
    description: 'Service creation date',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Service last update date',
  })
  updatedAt: string;

  // EVENT
  @ApiProperty({
    description: 'Event start date',
    example: '2023-12-20',
    required: false,
  })
  startDate?: string;

  @ApiProperty({
    description: 'Event end date',
    example: '2023-12-21',
    required: false,
  })
  endDate?: string;

  @ApiProperty({
    description: 'Event start time',
    example: '10:00',
    required: false,
  })
  startTime?: string;

  @ApiProperty({
    description: 'Event end time',
    example: '18:00',
    required: false,
  })
  endTime?: string;

  // SERVICE
  @ApiProperty({
    description: 'Available days of the week',
    type: [String],
    enum: DayOfWeek,
    example: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
    required: false,
  })
  availableDays?: DayOfWeek[];

  @ApiProperty({
    description: 'Working hours',
    example: { from: '09:00', to: '18:00' },
    required: false,
  })
  workingHours?: WorkingHours;
}
