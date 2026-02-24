import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { UpdateLinkedBeneficiaryDto } from './dto/update-linked-beneficiary.dto';

@Controller('beneficiaries')
@UseGuards(JwtAuthGuard)
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles('user')
  async getMyBeneficiary(@CurrentUser() user: CurrentUserPayload) {
    if (!user.userId) {
      return { beneficiary: null };
    }
    const beneficiary = await this.beneficiariesService.findLinkedBeneficiaryByUserId(
      user.userId,
    );
    if (!beneficiary) {
      return { beneficiary: null };
    }
    return {
      beneficiary: {
        id: beneficiary.id,
        full_name: beneficiary.full_name,
        email: beneficiary.email,
        created_at: beneficiary.created_at,
      },
    };
  }

  @Patch('me')
  @UseGuards(RolesGuard)
  @Roles('user')
  async updateMyBeneficiary(
    @CurrentUser() user: CurrentUserPayload,
    @Body() updateDto: UpdateLinkedBeneficiaryDto,
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID required');
    }
    const beneficiary = await this.beneficiariesService.updateLinkedBeneficiaryByUserId(
      user.userId,
      updateDto,
    );
    return {
      beneficiary: {
        id: beneficiary.id,
        full_name: beneficiary.full_name,
        email: beneficiary.email,
        created_at: beneficiary.created_at,
      },
    };
  }

  @Delete('me')
  @UseGuards(RolesGuard)
  @Roles('user')
  async unlinkMyBeneficiary(@CurrentUser() user: CurrentUserPayload) {
    if (!user.userId) {
      throw new BadRequestException('User ID required');
    }
    await this.beneficiariesService.unlinkBeneficiaryByUserId(user.userId);
    return { message: 'Beneficiary unlinked successfully' };
  }
}

