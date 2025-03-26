import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
  Query,
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

interface RequestWithUser extends Request {
  user: { id: string };
}

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiOperation({ summary: 'Create new service' })
  @ApiResponse({
    status: 201,
    description: 'Service successfully created',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: RequestWithUser,
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.create(req.user.id, createServiceDto);
  }

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
  @ApiResponse({
    status: 200,
    description: 'List of all services',
    type: [ServiceResponseDto],
  })
  @Get()
  async findAll(
    @Query() filters: FindServicesDto,
  ): Promise<ServiceResponseDto[]> {
    return this.servicesService.findAll(filters);
  }

  @ApiOperation({ summary: 'Get service by serviceId' })
  @ApiParam({
    name: 'serviceId',
    description: 'Service unique identifier',
    example: 'service_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Service details',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @Get(':serviceId')
  async findOne(
    @Param('serviceId') serviceId: string,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.findOne(serviceId);
  }

  @ApiOperation({ summary: 'Get services by user ID' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user services',
    type: [ServiceResponseDto],
  })
  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<ServiceResponseDto[]> {
    return this.servicesService.findByUserId(userId);
  }

  @ApiOperation({ summary: 'Update service' })
  @ApiParam({
    name: 'serviceId',
    description: 'Service unique identifier',
    example: 'service_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Service successfully updated',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own services',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':serviceId')
  async update(
    @Param('serviceId') serviceId: string,
    @Request() req: RequestWithUser,
    @Body() updateServiceDto: Partial<CreateServiceDto>,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.update(
      serviceId,
      req.user.id,
      updateServiceDto,
    );
  }

  @ApiOperation({ summary: 'Delete service' })
  @ApiParam({
    name: 'serviceId',
    description: 'Service unique identifier',
    example: 'service_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Service successfully deleted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own services',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':serviceId')
  async remove(
    @Param('serviceId') serviceId: string,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    return this.servicesService.remove(serviceId, req.user.id);
  }
}
