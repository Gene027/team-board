import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@app/common';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design project dashboard' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional({ example: 'Create the first dashboard layout.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.Todo })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.Medium })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '66b3fcb8f152aa994acba123' })
  @IsOptional()
  @IsMongoId()
  assigneeId?: string;
}
