import { ApiProperty } from '@nestjs/swagger';
import { ServiceResponseDto } from './service-response.dto';
import { PaginatedResponse } from '../../common/interfaces/pagination.interface';

export class PaginatedServicesResponseDto
  implements PaginatedResponse<ServiceResponseDto>
{
  @ApiProperty({
    description: 'Array of services',
    type: [ServiceResponseDto],
  })
  items: ServiceResponseDto[];

  @ApiProperty({
    description: 'Total number of services matching the query',
  })
  total: number;

  @ApiProperty({
    description: 'Number of items per page',
  })
  limit: number;

  @ApiProperty({
    description: 'Number of items to skip',
  })
  offset: number;
}
