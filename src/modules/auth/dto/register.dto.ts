import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { Match } from './match.decorator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]*$/, {
      message: 'first name should not contain numbers or special characters',
    })
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]*$/, {
    message: 'first name should not contain numbers or special characters',
  })
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'confirm password must be at least 6 characters long',
  })
  @Match('password', {
    message: 'confirm password does not match with password',
  })
  confirm_password?: string;
}
