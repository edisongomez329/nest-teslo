//import { PartialType } from '@nestjs/mapped-types';
//reemplazo del import de partialType por el de swagger para la ayuda de la documentación
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
