import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/DTOs/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './entities';

@ApiTags('Products')
@Controller('products')
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @ApiResponse({ status: 201, description: 'Product was creted', type: Product})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, Token related.' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    return await this.productsService.create(createProductDto, user);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    console.log(paginationDto);
    return await this.productsService.findAllPaginated(paginationDto);
  }

  // @Get(':id')
  // async findOne(@Param('id', ParseUUIDPipe) id: string) {
  //   console.log("entra en findOne");
  //   return await this.productsService.findOne(id);
  // }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log("entra en findOne");
    return await this.productsService.findOnePlane(id);
  }

  // @Get('findByterm')
  // findByterm(@Query('term') term: string) {
  //   console.log("entra en getByterm");
  //   //return this.productsService.findOneByTerm(term);
  // }



  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {

    return await this.productsService.update(id, updateProductDto, user);

  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
