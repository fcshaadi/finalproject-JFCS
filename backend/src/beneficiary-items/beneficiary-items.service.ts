import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../database/entities/item.entity';
import { Beneficiary } from '../database/entities/beneficiary.entity';

export interface BeneficiaryItemDto {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  file_path: string | null;
  is_released: boolean;
  released_at: Date | null;
  created_at: Date;
  user_full_name: string;
}

@Injectable()
export class BeneficiaryItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
    @InjectRepository(Beneficiary)
    private beneficiariesRepository: Repository<Beneficiary>,
  ) {}

  async getLinkedUserIds(beneficiaryId: string): Promise<string[]> {
    const beneficiary = await this.beneficiariesRepository.findOne({
      where: { id: beneficiaryId },
      relations: ['users'],
    });
    if (!beneficiary?.users?.length) return [];
    return beneficiary.users.map((u) => u.id);
  }

  async findReleasedItemsForBeneficiary(beneficiaryId: string): Promise<BeneficiaryItemDto[]> {
    const beneficiary = await this.beneficiariesRepository.findOne({
      where: { id: beneficiaryId },
      relations: ['users'],
    });
    if (!beneficiary || !beneficiary.users?.length) {
      return [];
    }
    const userIds = beneficiary.users.map((u) => u.id);
    const allItems: Item[] = [];
    for (const uid of userIds) {
      const list = await this.itemsRepository.find({
        where: { user_id: uid, is_released: true },
        relations: ['user'],
        order: { released_at: 'DESC' },
      });
      allItems.push(...list);
    }
    return allItems.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      content: item.content,
      file_path: item.file_path,
      is_released: item.is_released,
      released_at: item.released_at,
      created_at: item.created_at,
      user_full_name: item.user?.full_name ?? '',
    }));
  }
}
