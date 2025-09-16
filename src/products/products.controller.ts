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
  Patch,
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { ProductCategory } from './enums/product-category.enum';
import { User } from '../decorators/user.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The product has been successfully created.',
    type: ProductResponseDto,
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @User('id') userId: string,
  ) {
    return this.productsService.create(userId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all products matching filters.',
    type: PaginatedProductsResponseDto,
  })
  @ApiQuery({
    name: 'searchQuery',
    required: false,
    description: 'Search by product title',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price',
    type: Number,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
    enum: ProductCategory,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of items to skip',
    type: Number,
  })
  findAll(@Query() findProductsDto: FindProductsDto) {
    return this.productsService.findAll(findProductsDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get products by user ID' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return products by user ID.',
    type: PaginatedProductsResponseDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of items to skip',
    type: Number,
  })
  findByUserId(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.productsService.findByUserId(userId, { limit, offset });
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({
    name: 'productId',
    description: 'Product unique identifier',
    example: 'product_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return product by ID.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  findOne(@Param('productId') productId: string) {
    return this.productsService.findOne(productId);
  }

  @Put(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (PUT)' })
  @ApiParam({
    name: 'productId',
    description: 'Product unique identifier',
    example: 'product_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The product has been successfully updated.',
    type: ProductResponseDto,
  })
  update(
    @Param('productId') productId: string,
    @Body() updateProductDto: CreateProductDto,
    @User('id') userId: string,
  ) {
    return this.productsService.update(productId, userId, updateProductDto);
  }

  @Patch(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (PATCH)' })
  @ApiParam({
    name: 'productId',
    description: 'Product unique identifier',
    example: 'product_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The product has been successfully updated.',
    type: ProductResponseDto,
  })
  updatePatch(
    @Param('productId') productId: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
    @User('id') userId: string,
  ) {
    return this.productsService.update(productId, userId, updateProductDto);
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({
    name: 'productId',
    description: 'Product unique identifier',
    example: 'product_1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The product has been successfully deleted.',
  })
  remove(@Param('productId') productId: string, @User('id') userId: string) {
    return this.productsService.remove(productId, userId);
  }
}
