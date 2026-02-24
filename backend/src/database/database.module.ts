import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { Item } from './entities/item.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const isProduction = nodeEnv === 'production';
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [User, Beneficiary, Item],
          // This project has no migrations; keep schema auto-sync for non-production envs.
          synchronize: !isProduction,
          logging: !isProduction,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Beneficiary, Item]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

