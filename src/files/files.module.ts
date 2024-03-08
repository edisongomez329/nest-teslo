import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [FilesController],
  providers: [FilesService], //tambien funciono la inyección de configservice en los providers, para que pudiera ser usado el el file.service.ts
  imports: [ConfigModule]
})
export class FilesModule {}
