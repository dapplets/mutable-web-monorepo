import { Type } from 'class-transformer';
import {
  IsString,
  ValidateNested,
  IsObject,
  IsOptional,
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
