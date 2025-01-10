import { IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJobDto)
  jobs: CreateJobDto[];
}

export class CreateJobDto {
  @IsString()
  schedule: string; // cron expression

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  steps: CreateStepDto[];
}

export class CreateStepDto {
  @IsString()
  parserId: string;

  @IsString()
  url: string;
}
