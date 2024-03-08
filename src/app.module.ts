import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      //en prod no se deberia usar true, ya que esto sincroniza las tablas automaticamente
      //en lugar de esto se debería usar las migraciones      
      synchronize: true
    }),

    //esto hace que lo que este en la carpeta public este accesible para cualquiera
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),

    ProductsModule,

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
