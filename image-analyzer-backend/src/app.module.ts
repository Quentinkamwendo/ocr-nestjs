import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ImageController } from './controllers/image.controller';
import { ImageProcessingService } from './services/image-processing.service';
import { Image } from './entities/image.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'image_analyzer'),
        entities: [Image],
        synchronize: configService.get('DB_SYNCHRONIZE', false),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Image]),
    MulterModule.register({
      dest: './uploads/temp',
    }),
  ],
  controllers: [ImageController],
  providers: [ImageProcessingService],
})
export class AppModule {}
