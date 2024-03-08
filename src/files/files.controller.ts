import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { FileNamer } from './helpers/fileNamer.helper';
import { Express, Response } from 'express'
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {

    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);

    // res.status(403).json({
    //   ok: false,
    //   path: path
    // });

    //return path;
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: FileFilter,
    //limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: './static/products',
      filename: FileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {

    console.log({ fileController: file });
    if (!file) {
      throw new BadRequestException('File is empty, Or File is not an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    //const secureUrl = http://localhost:3000/api/files/product/6925edbe-c598-4c85-9897-2fcc5d0108ab_2024-02-06 12_02_59-Window.png
    return {secureUrl};
    return { fileName: file?.originalname };
  }

}
