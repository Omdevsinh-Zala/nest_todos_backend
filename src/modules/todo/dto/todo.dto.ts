import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsBeforeDate, IsFutureDate } from './match.decorator';

const trim = ({ value }: { value: string }) => value?.trim();

export class CreateTodoDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'title must contain only letters and spaces',
  })
  title: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsEnum(['backlog', 'in_progress', 'completed', 'cancelled'])
  status?: 'backlog' | 'in_progress' | 'completed' | 'cancelled';

  @IsOptional()
  @IsEnum(['none', 'low', 'medium', 'high', 'urgent'])
  priority?: 'none' | 'low' | 'medium' | 'high' | 'urgent';

  @IsOptional()
  @IsDateString()
  @IsFutureDate({ message: 'Due date must be a future date' })
  due_date?: string;

  @IsOptional()
  @IsDateString()
  @IsBeforeDate('due_date', { message: 'Reminder must be before due date' })
  reminder_at?: string;
}

export class UpdateTodoDto {
  @Transform(trim)
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'title must contain only letters and spaces',
  })
  title?: string;

  @Transform(trim)
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(['backlog', 'in_progress', 'completed', 'cancelled'])
  status?: 'backlog' | 'in_progress' | 'completed' | 'cancelled';

  @IsOptional()
  @IsEnum(['none', 'low', 'medium', 'high', 'urgent'])
  priority?: 'none' | 'low' | 'medium' | 'high' | 'urgent';

  @IsOptional()
  @IsDateString()
  @IsFutureDate({ message: 'Due date must be a future date' })
  due_date?: string;

  @IsOptional()
  @IsDateString()
  @IsBeforeDate('due_date', { message: 'Reminder must be before due date' })
  reminder_at?: string;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsString()
  bg_color?: string;

  @IsOptional()
  @IsUUID('4')
  parent_id?: string;

  @IsOptional()
  @IsDateString()
  completed_at?: string;
}
