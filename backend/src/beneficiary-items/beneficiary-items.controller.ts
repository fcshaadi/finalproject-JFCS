import { Controller, Get, UseGuards } from '@nestjs/common';
import { BeneficiaryItemsService } from './beneficiary-items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('beneficiary')
@UseGuards(JwtAuthGuard)
export class BeneficiaryItemsController {
  constructor(private readonly beneficiaryItemsService: BeneficiaryItemsService) {}

  @Get('items')
  @UseGuards(RolesGuard)
  @Roles('beneficiary')
  async getItems(@CurrentUser() user: CurrentUserPayload) {
    if (!user.beneficiaryId) {
      return { items: [] };
    }
    const items = await this.beneficiaryItemsService.findReleasedItemsForBeneficiary(
      user.beneficiaryId,
    );
    return { items };
  }
}
