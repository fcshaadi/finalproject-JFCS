import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { ItemsModule } from './items/items.module';
import { BeneficiaryItemsModule } from './beneficiary-items/beneficiary-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    BeneficiariesModule,
    AuthModule,
    ItemsModule,
    BeneficiaryItemsModule,
  ],
})

export class AppModule {}

