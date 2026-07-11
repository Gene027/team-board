import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class AddProjectMemberDto {
  @ApiProperty({ example: '66b3fcb8f152aa994acba123' })
  @IsMongoId()
  userId: string;
}
