import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDate,
  IsArray,
  ValidateIf,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCategory } from '../enums/service-category.enum';
import { DayOfWeek } from '../enums/day-of-week.enum';
import { WorkingHours } from '../interfaces/working-hours.interface';

class WorkingHoursDto implements WorkingHours {
  @ApiProperty({
    description: 'Opening time',
    example: '09:00',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    description: 'Closing time',
    example: '18:00',
  })
  @IsString()
  @IsNotEmpty()
  to: string;
}

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

  @ApiProperty({
    description: 'Service category',
    enum: ServiceCategory,
    example: ServiceCategory.SERVICE,
    default: ServiceCategory.SERVICE,
  })
  @IsEnum(ServiceCategory)
  @IsNotEmpty()
  category: ServiceCategory;

  //  EVENT
  @ApiProperty({
    description: 'Event start date',
    example: '2023-12-20',
    required: false,
  })
  @ValidateIf(
    (o: { category?: ServiceCategory }) => o.category === ServiceCategory.EVENT,
  )
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate?: Date;

  @ApiProperty({
    description: 'Event end date',
    example: '2023-12-21',
    required: false,
  })
  @ValidateIf(
    (o: { category?: ServiceCategory }) => o.category === ServiceCategory.EVENT,
  )
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate?: Date;

  @ApiProperty({
    description: 'Event start time',
    example: '10:00',
    required: false,
  })
  @ValidateIf(
    (o: { category?: ServiceCategory }) => o.category === ServiceCategory.EVENT,
  )
  @IsString()
  @IsNotEmpty()
  startTime?: string;

  @ApiProperty({
    description: 'Event end time',
    example: '18:00',
    required: false,
  })
  @ValidateIf(
    (o: { category?: ServiceCategory }) => o.category === ServiceCategory.EVENT,
  )
  @IsString()
  @IsNotEmpty()
  endTime?: string;

  //  SERVICE
  @ApiProperty({
    description: 'Available days of the week',
    type: [String],
    enum: DayOfWeek,
    example: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
    required: false,
  })
  @ValidateIf(
    (o: { category?: ServiceCategory }) =>
      o.category === ServiceCategory.SERVICE,
  )
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  availableDays?: DayOfWeek[];

  @ApiProperty({
    description: 'Working hours',
    type: WorkingHoursDto,
    example: { from: '09:00', to: '18:00' },
    required: false,
  })
  @ValidateIf(
    (o: { category?: ServiceCategory }) =>
      o.category === ServiceCategory.SERVICE,
  )
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto;
}
