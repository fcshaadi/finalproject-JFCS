import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateLinkedBeneficiaryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

