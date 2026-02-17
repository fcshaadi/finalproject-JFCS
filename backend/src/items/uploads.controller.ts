import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiary } from '../database/entities/beneficiary.entity';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(
    private readonly itemsService: ItemsService,
    @InjectRepository(Beneficiary)
    private beneficiaryRepository: Repository<Beneficiary>,
  ) {}

  @Get(':userId/:filename')
  async getFile(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    const filePath = `uploads/${userId}/${filename}`;
    const item = await this.itemsService.findByFilePath(filePath);
    if (!item) {
      throw new NotFoundException('File not found');
    }

    let hasAccess = false;
    if (user.userId && item.user_id === user.userId) {
      hasAccess = true;
    }
    if (!hasAccess && user.beneficiaryId) {
      const beneficiary = await this.beneficiaryRepository.findOne({
        where: { id: user.beneficiaryId },
        relations: ['users'],
      });
      const linkedUserIds = beneficiary?.users?.map((u) => u.id) ?? [];
      if (item.is_released && linkedUserIds.includes(item.user_id)) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this file');
    }

    const absolutePath = this.itemsService.getAbsoluteFilePath(item.file_path!);
    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException('File not found');
    }

    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.json': 'application/json',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.sendFile(path.resolve(absolutePath));
  }
}
