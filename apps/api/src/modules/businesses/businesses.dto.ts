import {
  IsString, IsOptional, IsEnum, IsUrl, MaxLength, MinLength,
} from 'class-validator';
import { BusinessStage } from './business.schema';

export class CreateBusinessDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsEnum(BusinessStage)
  stage?: BusinessStage;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  teamSize?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  revenueModel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  targetAudience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  goals?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  challenges?: string;
}

export class UpdateBusinessDto extends CreateBusinessDto {}
