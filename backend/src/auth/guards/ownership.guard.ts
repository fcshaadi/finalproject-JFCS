import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ItemsService } from '../../items/items.service';
import { CurrentUserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private itemsService: ItemsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUserPayload = request.user;
    const itemId = request.params.id;

    if (!user || !itemId) {
      return false;
    }

    // Only users (not beneficiaries) can own items
    if (user.role === 'beneficiary') {
      throw new ForbiddenException('Beneficiaries cannot modify items');
    }

    const userId = user.userId;
    if (!userId) {
      return false;
    }

    const item = await this.itemsService.findOne(itemId);
    if (!item) {
      return false;
    }

    if (item.user_id !== userId) {
      throw new ForbiddenException('You can only modify your own items');
    }

    return true;
  }
}

