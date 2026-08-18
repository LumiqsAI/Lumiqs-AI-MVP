import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class AnalyzeCompetitorDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  competitorName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;
}
