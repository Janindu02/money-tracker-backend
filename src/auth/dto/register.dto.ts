import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsStrongPassword } from '../validators/password-strength.validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, description: 'Uppercase, lowercase, number, and special character required' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @IsStrongPassword()
  password!: string;
}
