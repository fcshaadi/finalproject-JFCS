import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { CurrentUserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUserPayload = request.user;

    if (!user) {
      return false;
    }

    // Check if user's role matches any of the required roles
    return requiredRoles.some((role) => {
      if (role === 'user') {
        return user.role === 'user' || user.role === 'both';
      }
      if (role === 'beneficiary') {
        return user.role === 'beneficiary' || user.role === 'both';
      }
      return user.role === role;
    });
  }
}

