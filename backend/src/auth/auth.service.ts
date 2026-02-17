import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUserPayload } from './decorators/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Beneficiary } from '../database/entities/beneficiary.entity';

export interface RoleResult {
  role: 'user' | 'beneficiary' | 'both';
  userId?: string;
  beneficiaryId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private beneficiariesService: BeneficiariesService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Beneficiary)
    private beneficiariesRepository: Repository<Beneficiary>,
  ) {}

  async register(registerDto: RegisterDto) {
    // Create user
    const user = await this.usersService.create(
      registerDto.userFullName,
      registerDto.userEmail,
      registerDto.userPassword,
    );

    // Create beneficiary (email can be duplicate, no uniqueness check)
    const beneficiary = await this.beneficiariesService.create(
      registerDto.beneficiaryFullName,
      registerDto.beneficiaryEmail,
      registerDto.beneficiaryPassword,
    );

    // Create relationship
    user.beneficiaries = [beneficiary];
    await this.usersRepository.save(user);

    // Simulate payment (no real integration)
    // Account is automatically activated

    return {
      message: 'Registration successful. Payment simulated. Account activated.',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      beneficiary: {
        id: beneficiary.id,
        email: beneficiary.email,
        full_name: beneficiary.full_name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Resolve role
    const roleResult = await this.resolveRole(email);

    // Validate password based on role
    let isValid = false;
    if (roleResult.role === 'user' || roleResult.role === 'both') {
      const user = await this.usersService.findByEmail(email);
      if (user) {
        isValid = await this.usersService.validatePassword(user, password);
      }
    }

    if (!isValid && (roleResult.role === 'beneficiary' || roleResult.role === 'both')) {
      const beneficiary = await this.beneficiariesService.findByEmail(email);
      if (beneficiary) {
        isValid = await this.beneficiariesService.validatePassword(
          beneficiary,
          password,
        );
      }
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload: CurrentUserPayload = {
      sub: roleResult.userId || roleResult.beneficiaryId || '',
      email,
      role: roleResult.role,
      userId: roleResult.userId,
      beneficiaryId: roleResult.beneficiaryId,
    };

    const token = this.jwtService.sign(payload);

    // Build user object for response (for "user" or "both" use User; for "beneficiary" only use Beneficiary)
    let userPayload: { id: string; email: string; full_name: string };
    if (roleResult.role === 'user' || roleResult.role === 'both') {
      const u = await this.usersService.findByEmail(email);
      userPayload = u
        ? { id: u.id, email: u.email, full_name: u.full_name }
        : { id: '', email, full_name: '' };
    } else {
      const b = await this.beneficiariesService.findByEmail(email);
      userPayload = b
        ? { id: b.id, email: b.email, full_name: b.full_name }
        : { id: '', email, full_name: '' };
    }

    return {
      token,
      access_token: token,
      role: roleResult.role,
      user: userPayload,
    };
  }

  async resolveRole(email: string): Promise<RoleResult> {
    const user = await this.usersService.findByEmail(email);
    const beneficiary = await this.beneficiariesService.findByEmail(email);

    if (user && beneficiary) {
      return {
        role: 'both',
        userId: user.id,
        beneficiaryId: beneficiary.id,
      };
    }

    if (user) {
      return {
        role: 'user',
        userId: user.id,
      };
    }

    if (beneficiary) {
      return {
        role: 'beneficiary',
        beneficiaryId: beneficiary.id,
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}

