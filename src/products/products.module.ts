import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Product, ProductImage])],
  exports:[
    ProductsService,
    TypeOrmModule // en caso de querer usar los repositories de products en otro service distito al producService
  ]
})
export class ProductsModule {}
