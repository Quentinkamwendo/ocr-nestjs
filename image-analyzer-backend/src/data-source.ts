import { DataSource } from 'typeorm';
import { Image } from './entities/image.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1999NO1q',
  database: 'image_analyzer',
  entities: [Image],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Always set to false when using migrations
});
