import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Item } from './item.entity';
import { Beneficiary } from './beneficiary.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Item, (item) => item.user)
  items: Item[];

  @ManyToMany(() => Beneficiary, (beneficiary) => beneficiary.users)
  @JoinTable({
    name: 'user_beneficiaries',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'beneficiary_id', referencedColumnName: 'id' },
  })
  beneficiaries: Beneficiary[];
}

