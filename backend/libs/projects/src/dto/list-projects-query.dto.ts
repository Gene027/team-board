import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@app/common';

const trimEmptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? undefined : trimmedValue;
};

export class ListProjectsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search projects by name.',
    example: 'Website',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimEmptyStringToUndefined(value))
  @IsString()
  @MaxLength(100)
  search?: string;
}
