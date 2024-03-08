import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
//import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/DTOs/pagination.dto';
import { validate as isUUId } from 'uuid';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {


  private readonly logger = new Logger('ProductsService')

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource

  ) {
  }


  /**
   * el operador ... trabaja en la desesctruturación de images y productDetails como res
   * y en el productRepository.create como operador spread
   * @param createProductDto 
   * @returns 
   */
  async create(createProductDto: CreateProductDto, user: User) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({url: image})),
        user
      });

      await this.productRepository.save(product);
      return { ...product, images } ;

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /** */
  async findAll() {
    return await this.productRepository.find();
  }

  async findAllPaginated({ limit = 2, offset = 0 }: PaginationDto) {
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      },
    });

    //map con desestructuración
    return products.map(({ images, ...products } ) => ({
      ...products,
      images: images.map(img => img.url)
    }));

    //map normal
    return products.map(product => ({
      ...product,
      images: product.images.map( img => img.url )
    }));

  }

  /**
   * distintas formas de buscar un item en alguna tabla con las variaciones del metodo find
   * @param id 
   * @returns 
   */
  async findOne(id: string) {


    const product =
      await this.productRepository.findOneBy({ id });

    // const product = 
    // await this.productRepository.findOne({
    //   where: { id: id }
    // });

    if (!product) {
      throw new NotFoundException(`producto no encontrado por id ${id}`);
    }

    return product;
  }

  async findOneByTerm(term: string) {

    let product: Product;

    if(isUUId(term)) {
      product = await this.productRepository.findOneBy({ id : term });
    } else {
      //product = await this.productRepository.findOneBy({ slug : term });
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //prod = alias sql

      term = term.toLocaleLowerCase();

      product = await queryBuilder.where('Lower(title) =:title or slug =:slug', {
        title: term,
        slug: term
      })
      .leftJoinAndSelect('prod.images', 'img') //img = alias sql
      .getOne();
    }
    // const product = 
    // await this.productRepository.findOne({
    //   where: { id: id }
    // });

    if (!product) {
      throw new NotFoundException(`producto no encontrado por el valor ${term}`);
    }

    return product;
  }

  async findOnePlane(term: string) {
    const { images = [], ...rest } = await this.findOneByTerm(term);

    return {
      ...rest,
      images: images.map(img => img.url)
    };
  };

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {


    const { images, ...productsToUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...productsToUpdate
    });

    if (!product) {
      throw new NotFoundException(`producto no encontrado por el id ${id}`);
    }

    //create query runner
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
    
      if(images){
        await queryRunner.manager.delete(ProductImage, {product: {id}})

        product.images = images.map(
          img => this.productImageRepository.create({ url: img})
        );
      }
      product.user = user; 
      await queryRunner.manager.save(product);
      //await this.productRepository.save(product)


      await queryRunner.commitTransaction();
      await queryRunner.release();
      return await this.findOnePlane(id);// product;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return this.handleDBExceptions(error); 
    }
    

  }

  async remove(id: string) {

    const product = await this.findOne(id);

    await this.productRepository.remove(product);

    return true;
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete()
                        .where({})
                        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    console.log(error);
    if (error.code === '23505') {
      throw new BadRequestException(`${error.detail}`)
    }

    //this.logger.error(error);
    throw new InternalServerErrorException('Error al insertar producto!');
  }
}
