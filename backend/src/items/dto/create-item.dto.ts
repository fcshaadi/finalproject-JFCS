import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  content?: string;
}
