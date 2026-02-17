import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../database/entities/item.entity';
import { Beneficiary } from '../database/entities/beneficiary.entity';
import { ItemsController } from './items.controller';
import { UploadsController } from './uploads.controller';
import { ItemsService } from './items.service';
import { OwnershipGuard } from './guards/ownership.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, Beneficiary]),
    AuthModule,
  ],
  controllers: [ItemsController, UploadsController],
  providers: [ItemsService, OwnershipGuard],
  exports: [ItemsService],
})
export class ItemsModule {}
