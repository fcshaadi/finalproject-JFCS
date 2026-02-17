import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Item } from '../database/entities/item.entity';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class ItemsService {
  private uploadPath: string;

  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
    private configService: ConfigService,
  ) {
    this.uploadPath =
      this.configService.get<string>('UPLOAD_PATH') || './uploads';
  }

  async create(
    userId: string,
    title: string,
    content?: string | null,
    file?: Express.Multer.File,
  ): Promise<Item> {
    if (!content && !file) {
      throw new BadRequestException('At least one of content or file is required');
    }

    let file_path: string | null = null;
    if (file) {
      const userDir = path.join(this.uploadPath, userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      const ext = path.extname(file.originalname) || '';
      const filename = `${randomUUID()}${ext}`;
      const filePath = path.join(userDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      file_path = path.join('uploads', userId, filename).replace(/\\/g, '/');
    }

    const item = this.itemsRepository.create({
      user_id: userId,
      title,
      content: content || null,
      file_path,
      is_released: false,
      released_at: null,
    });
    return await this.itemsRepository.save(item);
  }

  async findAllByUserId(userId: string): Promise<Item[]> {
    return await this.itemsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Item | null> {
    return await this.itemsRepository.findOne({ where: { id } });
  }

  async findByFilePath(filePath: string): Promise<Item | null> {
    const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
    return await this.itemsRepository.findOne({
      where: { file_path: normalized },
      relations: ['user'],
    });
  }

  async findOneOrFail(id: string): Promise<Item> {
    const item = await this.findOne(id);
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async update(
    id: string,
    userId: string,
    updates: { title?: string; content?: string },
  ): Promise<Item> {
    const item = await this.findOneOrFail(id);
    if (item.user_id !== userId) {
      throw new NotFoundException('Item not found');
    }
    if (updates.title !== undefined) item.title = updates.title;
    if (updates.content !== undefined) item.content = updates.content;
    return await this.itemsRepository.save(item);
  }

  async remove(id: string, userId: string): Promise<void> {
    const item = await this.findOneOrFail(id);
    if (item.user_id !== userId) {
      throw new NotFoundException('Item not found');
    }
    if (item.file_path) {
      const fullPath = path.join(
        this.uploadPath,
        item.file_path.replace(/^uploads[/\\]/, ''),
      );
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    await this.itemsRepository.remove(item);
  }

  async release(id: string, userId: string): Promise<Item> {
    const item = await this.findOneOrFail(id);
    if (item.user_id !== userId) {
      throw new NotFoundException('Item not found');
    }
    item.is_released = true;
    item.released_at = new Date();
    return await this.itemsRepository.save(item);
  }

  getAbsoluteFilePath(relativePath: string): string {
    const sanitized = relativePath
      .replace(/\.\./g, '')
      .replace(/^[/\\]/, '')
      .replace(/^uploads[/\\]/i, '');
    return path.join(this.uploadPath, sanitized);
  }

  hasAccessToFile(
    filePath: string,
    userId: string | undefined,
    beneficiaryId: string | undefined,
    isReleased: boolean,
    itemUserId: string,
    beneficiaryUserIds: string[],
  ): boolean {
    if (userId && itemUserId === userId) return true;
    if (beneficiaryId && isReleased && beneficiaryUserIds.includes(itemUserId))
      return true;
    return false;
  }
}
