import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { FindServicesDto } from './dto/find-services.dto';
import { PaginatedServicesResponseDto } from './dto/paginated-services-response.dto';
import { ServiceCategory } from './enums/service-category.enum';
import { User } from '../decorators/user.decorator';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new service' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The service has been successfully created.',
    type: ServiceResponseDto,
  })
  create(
    @Body() createServiceDto: CreateServiceDto,
    @User('userId') userId: string,
  ) {
    return this.servicesService.create(userId, createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiQuery({
    name: 'searchTitle',
    required: false,
    description: 'Search services by title',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter services by location',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
    enum: ServiceCategory,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items to return',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of items to skip',
    type: Number,
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all services.',
    type: PaginatedServicesResponseDto,
  })
  findAll(@Query() query: FindServicesDto) {
    return this.servicesService.findAll(query);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get services by user ID' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return services by user ID.',
    type: PaginatedServicesResponseDto,
  })
  findByUserId(
    @Param('userId') userId: string,
    @Query() pagination: FindServicesDto,
  ) {
    return this.servicesService.findByUserId(userId, pagination);
  }

  @Get(':serviceId')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({
    name: 'serviceId',
    description: 'Service unique identifier',
    example: 'service_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return service by ID.',
    type: ServiceResponseDto,
  })
  findOne(@Param('serviceId') serviceId: string) {
    return this.servicesService.findOne(serviceId);
  }

  @Put(':serviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service' })
  @ApiParam({
    name: 'serviceId',
    description: 'Service unique identifier',
    example: 'service_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The service has been successfully updated.',
    type: ServiceResponseDto,
  })
  update(
    @Param('serviceId') serviceId: string,
    @Body() updateServiceDto: CreateServiceDto,
    @User('userId') userId: string,
  ) {
    return this.servicesService.update(serviceId, userId, updateServiceDto);
  }

  @Delete(':serviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete service' })
  @ApiParam({
    name: 'serviceId',
    description: 'Service unique identifier',
    example: 'service_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The service has been successfully deleted.',
  })
  remove(
    @Param('serviceId') serviceId: string,
    @User('userId') userId: string,
  ) {
    return this.servicesService.remove(serviceId, userId);
  }
}
