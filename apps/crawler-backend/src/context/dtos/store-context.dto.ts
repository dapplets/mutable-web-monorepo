import { Type } from 'class-transformer';
import {
  IsString,
  ValidateNested,
  IsObject,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class ContextDto {
  @IsString()
  namespace: string;

  @IsString()
  contextType: string;

  @IsString()
  @IsOptional()
  id: string | null;

  @IsObject()
  parsedContext: any;

  @ValidateNested({ each: true })
  @Type(() => ContextDto)
  @IsOptional()
  children?: ContextDto[];

  @ValidateNested()
  @Type(() => ContextDto)
  @IsOptional()
  parentNode?: ContextDto | null;
}

export class StoreContextDto {
  @ValidateNested()
  @Type(() => ContextDto)
  context: ContextDto;

  @IsString()
  receiverId: string;
}

export class InvokeAgentDto {
  @ValidateNested()
  @Type(() => ContextDto)
  context: ContextDto;

  @IsString()
  @IsOptional()
  receiverId?: string;

  @IsString()
  agentId: string;
}

export class QuerySimilarContextDto {
  @ValidateNested()
  @Type(() => ContextDto)
  context: ContextDto;

  @IsNumber()
  limit: number;
}
