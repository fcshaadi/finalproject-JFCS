import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiary } from '../database/entities/beneficiary.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BeneficiariesService {
  constructor(
    @InjectRepository(Beneficiary)
    private beneficiariesRepository: Repository<Beneficiary>,
  ) {}

  async create(
    fullName: string,
    email: string,
    password: string,
  ): Promise<Beneficiary> {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create beneficiary (email can be duplicate)
    const beneficiary = this.beneficiariesRepository.create({
      full_name: fullName,
      email,
      password_hash: passwordHash,
    });

    return await this.beneficiariesRepository.save(beneficiary);
  }

  async findByEmail(email: string): Promise<Beneficiary | null> {
    return await this.beneficiariesRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<Beneficiary | null> {
    return await this.beneficiariesRepository.findOne({
      where: { id },
    });
  }

  async validatePassword(
    beneficiary: Beneficiary,
    password: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, beneficiary.password_hash);
  }

  async findBeneficiariesByUserIds(userIds: string[]): Promise<Beneficiary[]> {
    return await this.beneficiariesRepository
      .createQueryBuilder('beneficiary')
      .innerJoin('beneficiary.users', 'user')
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();
  }
}

