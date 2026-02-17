import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiariesService } from './beneficiaries.service';
import { Beneficiary } from '../database/entities/beneficiary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Beneficiary])],
  providers: [BeneficiariesService],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {}

