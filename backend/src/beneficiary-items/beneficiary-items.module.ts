import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../database/entities/item.entity';
import { Beneficiary } from '../database/entities/beneficiary.entity';
import { BeneficiaryItemsController } from './beneficiary-items.controller';
import { BeneficiaryItemsService } from './beneficiary-items.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, Beneficiary]),
    AuthModule,
  ],
  controllers: [BeneficiaryItemsController],
  providers: [BeneficiaryItemsService],
  exports: [BeneficiaryItemsService],
})
export class BeneficiaryItemsModule {}
