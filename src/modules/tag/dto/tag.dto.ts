import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

const trim = ({ value }: { value: string }) => value?.trim();

export class CreateTagDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'name must contain only letters and spaces.',
  })
  name: string;

  @IsString()
  @IsOptional()
  color: string;

  @IsBoolean()
  @IsOptional()
  is_pinned?: boolean;
}

export class UpdateTagDto {
  @Transform(trim)
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'name must contain only letters and spaces.',
  })
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
