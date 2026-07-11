import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddTaskCommentDto {
  @ApiProperty({ example: 'I started working on this and will share updates today.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  body: string;
}
