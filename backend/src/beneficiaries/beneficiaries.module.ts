import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiariesService } from './beneficiaries.service';
import { Beneficiary } from '../database/entities/beneficiary.entity';
import { User } from '../database/entities/user.entity';
import { BeneficiariesController } from './beneficiaries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Beneficiary, User])],
  controllers: [BeneficiariesController],
  providers: [BeneficiariesService],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {}

