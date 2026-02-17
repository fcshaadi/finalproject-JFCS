import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  userFullName: string;

  @IsNotEmpty()
  @IsEmail()
  userEmail: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  userPassword: string;

  @IsNotEmpty()
  @IsString()
  beneficiaryFullName: string;

  @IsNotEmpty()
  @IsEmail()
  beneficiaryEmail: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  beneficiaryPassword: string;
}

