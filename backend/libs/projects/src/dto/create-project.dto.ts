import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Public website redesign project.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
