import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ada@teamboard.dev' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssword1', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
