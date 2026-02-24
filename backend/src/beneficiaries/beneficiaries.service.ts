import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiary } from '../database/entities/beneficiary.entity';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateLinkedBeneficiaryDto } from './dto/update-linked-beneficiary.dto';

@Injectable()
export class BeneficiariesService {
  constructor(
    @InjectRepository(Beneficiary)
    private beneficiariesRepository: Repository<Beneficiary>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  async findLinkedBeneficiaryByUserId(userId: string): Promise<Beneficiary | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['beneficiaries'],
    });
    if (!user || !user.beneficiaries?.length) {
      return null;
    }
    return user.beneficiaries[0];
  }

  async updateLinkedBeneficiaryByUserId(
    userId: string,
    updateDto: UpdateLinkedBeneficiaryDto,
  ): Promise<Beneficiary> {
    const beneficiary = await this.findLinkedBeneficiaryByUserId(userId);
    if (!beneficiary) {
      throw new NotFoundException('No linked beneficiary found');
    }

    if (updateDto.full_name !== undefined) {
      beneficiary.full_name = updateDto.full_name.trim();
    }
    if (updateDto.email !== undefined) {
      beneficiary.email = updateDto.email.trim();
    }
    if (updateDto.password !== undefined) {
      beneficiary.password_hash = await bcrypt.hash(updateDto.password, 10);
    }

    return await this.beneficiariesRepository.save(beneficiary);
  }

  async unlinkBeneficiaryByUserId(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['beneficiaries'],
    });
    if (!user || !user.beneficiaries?.length) {
      throw new NotFoundException('No linked beneficiary found');
    }

    user.beneficiaries = [];
    await this.usersRepository.save(user);
  }
}

