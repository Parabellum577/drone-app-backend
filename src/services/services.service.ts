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

interface ServiceQuery {
  title?: { $regex: string; $options: string };
  location?: { $regex: string; $options: string };
  price?: { $gte?: string; $lte?: string };
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    private readonly usersService: UsersService,
  ) {}

  private generateServiceId(): string {
    return `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async create(
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    const service = await this.serviceModel.create({
      ...createServiceDto,
      serviceId: this.generateServiceId(),
      created_by: new Types.ObjectId(userId),
    });

    return this.mapServiceToResponse(await service.populate('created_by'));
  }

  async findAll(filters?: FindServicesDto): Promise<ServiceResponseDto[]> {
    const query: ServiceQuery = {};

    if (filters?.searchTitle) {
      query.title = { $regex: filters.searchTitle, $options: 'i' };
    }

    if (filters?.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters?.minPrice || filters?.maxPrice) {
      query.price = {};
      if (filters.minPrice) {
        query.price.$gte = filters.minPrice.toString();
      }
      if (filters.maxPrice) {
        query.price.$lte = filters.maxPrice.toString();
      }
    }

    const services = await this.serviceModel
      .find(query)
      .populate('created_by')
      .exec();

    return services.map((service) => this.mapServiceToResponse(service));
  }

  async findByUserId(userId: string): Promise<ServiceResponseDto[]> {
    const services = await this.serviceModel
      .find({ created_by: new Types.ObjectId(userId) })
      .populate('created_by')
      .exec();
    return services.map((service) => this.mapServiceToResponse(service));
  }

  async findOne(serviceId: string): Promise<ServiceResponseDto> {
    const service = await this.serviceModel
      .findOne({ serviceId })
      .populate('created_by')
      .exec();
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
    const service = await this.serviceModel.findOne({ serviceId }).exec();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.created_by.toString() !== userId) {
      throw new BadRequestException('You can only update your own services');
    }

    const updatedService = await this.serviceModel
      .findOneAndUpdate({ serviceId }, updateData, { new: true })
      .populate('created_by')
      .exec();

    return this.mapServiceToResponse(updatedService!);
  }

  async remove(serviceId: string, userId: string): Promise<void> {
    const service = await this.serviceModel.findOne({ serviceId }).exec();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.created_by.toString() !== userId) {
      throw new BadRequestException('You can only delete your own services');
    }

    await this.serviceModel.findOneAndDelete({ serviceId }).exec();
  }

  private mapServiceToResponse(service: ServiceDocument): ServiceResponseDto {
    return {
      id: service._id.toString(),
      serviceId: service.serviceId,
      title: service.title,
      description: service.description,
      price: service.price,
      currency: service.currency,
      location: service.location,
      created_by: service.created_by._id.toString(),
      image: service.image,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }
}
