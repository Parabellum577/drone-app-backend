import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from './service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { UsersService } from '../users/users.service';
import { FindServicesDto } from './dto/find-services.dto';
import { PaginatedServicesResponseDto } from './dto/paginated-services-response.dto';
import { ServiceCategory } from './enums/service-category.enum';
import { PaginationParams } from '../common/interfaces/pagination.interface';

interface PriceQuery {
  $gte?: number;
  $lte?: number;
}

interface ServiceQuery {
  title?: { $regex: string; $options: string };
  location?: { $regex: string; $options: string };
  price?: PriceQuery;
  category?: string;
  $or?: Array<{ location: { $regex: string; $options: string } }>;
  $and?: Array<{
    $or?: Array<{ location: { $regex: string; $options: string } }>;
    price?: PriceQuery;
  }>;
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name)
    public readonly serviceModel: Model<ServiceDocument>,
    private readonly usersService: UsersService,
  ) {}

  private generateServiceId(): string {
    return `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async create(
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    this.validateServiceFields(createServiceDto);

    const service = await this.serviceModel.create({
      ...createServiceDto,
      price: Number(createServiceDto.price),
      serviceId: this.generateServiceId(),
      created_by: new Types.ObjectId(userId),
    });

    return this.mapServiceToResponse(await service.populate('created_by'));
  }

  async findAll(
    filters?: FindServicesDto,
  ): Promise<PaginatedServicesResponseDto> {
    const query: ServiceQuery = {};
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;

    if (filters?.searchTitle) {
      query.title = { $regex: filters.searchTitle, $options: 'i' };
    }

    if (filters?.location) {
      const locationParts = filters.location
        .split(',')
        .map((part) => part.trim());
      query.$or = [
        { location: { $regex: filters.location, $options: 'i' } },
        ...locationParts.map((part) => ({
          location: { $regex: part, $options: 'i' },
        })),
      ];
    }

    if (filters?.minPrice || filters?.maxPrice) {
      const priceQuery: PriceQuery = {};
      if (filters.minPrice) {
        priceQuery.$gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        priceQuery.$lte = filters.maxPrice;
      }
      if (Object.keys(priceQuery).length > 0) {
        query.price = priceQuery;
      }
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    if (query.$or && query.price) {
      const locationOr = query.$or;
      delete query.$or;
      query.$and = [{ $or: locationOr }, { price: query.price }];
      delete query.price;
    }

    const total = await this.serviceModel.countDocuments(query).exec();

    const services = await this.serviceModel
      .find(query)
      .populate('created_by')
      .skip(offset)
      .limit(limit)
      .exec();

    const items = services.map((service) => this.mapServiceToResponse(service));

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedServicesResponseDto> {
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    const query = { created_by: new Types.ObjectId(userId) };

    const total = await this.serviceModel.countDocuments(query).exec();

    const services = await this.serviceModel
      .find(query)
      .populate('created_by')
      .skip(offset)
      .limit(limit)
      .exec();

    const items = services.map((service) => this.mapServiceToResponse(service));

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async findOne(serviceId: string): Promise<ServiceResponseDto> {
    let service;

    const isValidObjectId = Types.ObjectId.isValid(serviceId);

    if (isValidObjectId) {
      service = await this.serviceModel
        .findOne({ _id: new Types.ObjectId(serviceId) })
        .populate('created_by')
        .exec();
    }

    if (!service) {
      service = await this.serviceModel
        .findOne({ serviceId })
        .populate('created_by')
        .exec();
    }

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.mapServiceToResponse(service);
  }

  async update(
    serviceId: string,
    userId: string,
    updateData: Partial<CreateServiceDto>,
  ): Promise<ServiceResponseDto> {
    let service;

    const isValidObjectId = Types.ObjectId.isValid(serviceId);

    if (isValidObjectId) {
      service = await this.serviceModel
        .findOne({ _id: new Types.ObjectId(serviceId) })
        .exec();
    }

    if (!service) {
      service = await this.serviceModel.findOne({ serviceId }).exec();
    }

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.created_by.toString() !== userId) {
      throw new BadRequestException('You can only update your own services');
    }

    if (updateData.category && updateData.category !== service.category) {
      this.validateServiceFields({
        ...service.toObject(),
        ...updateData,
      });
    }

    const actualServiceId = service.serviceId;

    const updatedService = await this.serviceModel
      .findOneAndUpdate({ serviceId: actualServiceId }, updateData, {
        new: true,
      })
      .populate('created_by')
      .exec();

    return this.mapServiceToResponse(updatedService!);
  }

  async remove(serviceId: string, userId: string): Promise<void> {
    let service;

    const isValidObjectId = Types.ObjectId.isValid(serviceId);

    if (isValidObjectId) {
      service = await this.serviceModel
        .findOne({ _id: new Types.ObjectId(serviceId) })
        .exec();
    }

    if (!service) {
      service = await this.serviceModel.findOne({ serviceId }).exec();
    }

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.created_by.toString() !== userId) {
      throw new BadRequestException('You can only delete your own services');
    }

    const actualServiceId = service.serviceId;

    await this.serviceModel
      .findOneAndDelete({ serviceId: actualServiceId })
      .exec();
  }

  private mapServiceToResponse(service: ServiceDocument): ServiceResponseDto {
    const response: ServiceResponseDto = {
      serviceId: service.serviceId,
      title: service.title,
      description: service.description,
      price: service.price,
      currency: service.currency,
      location: service.location,
      created_by: service.created_by._id.toString(),
      image: service.image,
      category: service.category,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };

    if (service.category === ServiceCategory.EVENT) {
      if (service.startDate) {
        response.startDate = service.startDate.toISOString().split('T')[0];
      }
      if (service.endDate) {
        response.endDate = service.endDate.toISOString().split('T')[0];
      }
      response.startTime = service.startTime;
      response.endTime = service.endTime;
    } else if (service.category === ServiceCategory.SERVICE) {
      response.availableDays = service.availableDays;
      response.workingHours = service.workingHours;
    }

    return response;
  }

  private validateServiceFields(data: Partial<CreateServiceDto>): void {
    const { category } = data;

    if (category === ServiceCategory.EVENT) {
      if (!data.startDate) {
        throw new BadRequestException('Start date is required for events');
      }
      if (!data.endDate) {
        throw new BadRequestException('End date is required for events');
      }
      if (!data.startTime) {
        throw new BadRequestException('Start time is required for events');
      }
      if (!data.endTime) {
        throw new BadRequestException('End time is required for events');
      }
    } else if (category === ServiceCategory.SERVICE) {
      if (!data.availableDays || data.availableDays.length === 0) {
        throw new BadRequestException(
          'Available days are required for services',
        );
      }
      if (!data.workingHours) {
        throw new BadRequestException(
          'Working hours are required for services',
        );
      }
      if (!data.workingHours.from || !data.workingHours.to) {
        throw new BadRequestException(
          'Working hours must include from and to times',
        );
      }
    }
  }
}
