import {
  IsString, IsOptional, IsEnum, IsIn, IsObject, IsUrl, MaxLength, MinLength,
} from 'class-validator';
import { BusinessStage } from './business.schema';

export class CreateBusinessDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsUrl({ require_protocol: true })
  @MaxLength(200)
  website: string;

  @IsString()
  @MaxLength(100)
  industry: string;

  @IsEnum(BusinessStage)
  stage: BusinessStage;

  @IsString()
  @MaxLength(100)
  country: string;

  @IsString()
  @MaxLength(50)
  teamSize: string;

  @IsString()
  @MaxLength(200)
  revenueModel: string;

  @IsString()
  @MaxLength(500)
  targetAudience: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsString()
  @MaxLength(2000)
  goals: string;

  @IsString()
  @MaxLength(2000)
  challenges: string;

  @IsOptional() @IsIn(['manual', 'public_website'])
  profileSource?: 'manual' | 'public_website';

  @IsOptional() @IsObject()
  publicProfile?: Record<string, unknown>;
}

export class UpdateBusinessDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100) name?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(200) website?: string;
  @IsOptional() @IsString() @MaxLength(100) industry?: string;
  @IsOptional() @IsEnum(BusinessStage) stage?: BusinessStage;
  @IsOptional() @IsString() @MaxLength(100) country?: string;
  @IsOptional() @IsString() @MaxLength(50) teamSize?: string;
  @IsOptional() @IsString() @MaxLength(200) revenueModel?: string;
  @IsOptional() @IsString() @MaxLength(500) targetAudience?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(2000) goals?: string;
  @IsOptional() @IsString() @MaxLength(2000) challenges?: string;
  @IsOptional() @IsIn(['manual', 'public_website']) profileSource?: 'manual' | 'public_website';
  @IsOptional() @IsObject() publicProfile?: Record<string, unknown>;
}

export class DiscoverBusinessDto {
  @IsString() @MinLength(2) @MaxLength(100) name: string;
  @IsUrl({ require_protocol: true }) @MaxLength(200) website: string;
}
