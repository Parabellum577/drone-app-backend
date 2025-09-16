import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { PaginationParams } from '../common/interfaces/pagination.interface';

interface PriceQuery {
  $gte?: number;
  $lte?: number;
}

interface ProductQuery {
  title?: { $regex: string; $options: string };
  price?: PriceQuery;
  category?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  private generateProductId(): string {
    return `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async create(
    userId: string,
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productModel.create({
      ...createProductDto,
      price: Number(createProductDto.price),
      productId: this.generateProductId(),
      created_by: new Types.ObjectId(userId),
    });

    return this.mapProductToResponse(await product.populate('created_by'));
  }

  async findAll(
    filters?: FindProductsDto,
  ): Promise<PaginatedProductsResponseDto> {
    const query: ProductQuery = {};
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;

    if (filters?.searchQuery) {
      query.title = { $regex: filters.searchQuery, $options: 'i' };
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

    const total = await this.productModel.countDocuments(query).exec();

    const products = await this.productModel
      .find(query)
      .populate('created_by')
      .skip(offset)
      .limit(limit)
      .exec();

    const items = products.map((product) => this.mapProductToResponse(product));

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
  ): Promise<PaginatedProductsResponseDto> {
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || 0;

    const query = { created_by: new Types.ObjectId(userId) };

    const total = await this.productModel.countDocuments(query).exec();

    const products = await this.productModel
      .find(query)
      .populate('created_by')
      .skip(offset)
      .limit(limit)
      .exec();

    const items = products.map((product) => this.mapProductToResponse(product));

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async findOne(productId: string): Promise<ProductResponseDto> {
    let product;

    const isValidObjectId = Types.ObjectId.isValid(productId);

    if (isValidObjectId) {
      product = await this.productModel
        .findOne({ _id: new Types.ObjectId(productId) })
        .populate('created_by')
        .exec();
    }

    if (!product) {
      product = await this.productModel
        .findOne({ productId })
        .populate('created_by')
        .exec();
    }

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProductToResponse(product);
  }

  async update(
    productId: string,
    userId: string,
    updateData: Partial<CreateProductDto>,
  ): Promise<ProductResponseDto> {
    let product;

    const isValidObjectId = Types.ObjectId.isValid(productId);

    if (isValidObjectId) {
      product = await this.productModel
        .findOne({ _id: new Types.ObjectId(productId) })
        .exec();
    }

    if (!product) {
      product = await this.productModel.findOne({ productId }).exec();
    }

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.created_by.toString() !== userId) {
      throw new BadRequestException('You can only update your own products');
    }

    const actualProductId = product.productId;

    const updatedProduct = await this.productModel
      .findOneAndUpdate({ productId: actualProductId }, updateData, {
        new: true,
      })
      .populate('created_by')
      .exec();

    return this.mapProductToResponse(updatedProduct!);
  }

  async remove(productId: string, userId: string): Promise<void> {
    let product;

    const isValidObjectId = Types.ObjectId.isValid(productId);

    if (isValidObjectId) {
      product = await this.productModel
        .findOne({ _id: new Types.ObjectId(productId) })
        .exec();
    }

    if (!product) {
      product = await this.productModel.findOne({ productId }).exec();
    }

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.created_by.toString() !== userId) {
      throw new BadRequestException('You can only delete your own products');
    }

    const actualProductId = product.productId;

    await this.productModel
      .findOneAndDelete({ productId: actualProductId })
      .exec();
  }

  private mapProductToResponse(product: ProductDocument): ProductResponseDto {
    return {
      productId: product.productId,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      images: product.images,
      category: product.category,
      created_by: product.created_by._id.toString(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
