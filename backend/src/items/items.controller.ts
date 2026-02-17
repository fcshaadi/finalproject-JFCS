import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { OwnershipGuard } from './guards/ownership.guard';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('user')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body('title') title: string,
    @Body('content') content: string | undefined,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID required');
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestException('Title is required');
    }
    const contentVal = typeof content === 'string' ? content.trim() || undefined : undefined;
    if (!contentVal && !file) {
      throw new BadRequestException('At least one of content or file is required');
    }
    const item = await this.itemsService.create(
      user.userId,
      title.trim(),
      contentVal || null,
      file,
    );
    return item;
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('user')
  async findAll(@CurrentUser() user: CurrentUserPayload) {
    if (!user.userId) {
      return { items: [] };
    }
    const items = await this.itemsService.findAllByUserId(user.userId);
    return { items };
  }

  @Patch(':id')
  @UseGuards(RolesGuard, OwnershipGuard)
  @Roles('user')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID required');
    }
    return await this.itemsService.update(id, user.userId, {
      title: updateItemDto.title,
      content: updateItemDto.content,
    });
  }

  @Delete(':id')
  @UseGuards(RolesGuard, OwnershipGuard)
  @Roles('user')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID required');
    }
    await this.itemsService.remove(id, user.userId);
    return { message: 'Item deleted successfully' };
  }

  @Patch(':id/release')
  @UseGuards(RolesGuard, OwnershipGuard)
  @Roles('user')
  async release(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID required');
    }
    return await this.itemsService.release(id, user.userId);
  }
}
