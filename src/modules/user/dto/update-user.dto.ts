import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';
import { IsPresent } from './match.decorator';
import { Match } from '../../auth/dto/match.decorator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z\s]*$/, {
    message: 'first name should not contain numbers or special characters',
  })
  first_name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z\s]*$/, {
    message: 'last name should not contain numbers or special characters',
  })
  last_name?: string;

  @IsString()
  @IsOptional()
  @Matches(
    /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/,
    {
      message: 'password should contain at least one special character',
    },
  )
  @IsPresent('new_password')
  @IsPresent('confirm_password')
  old_password?: string;

  @IsString()
  @IsOptional()
  @Matches(
    /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/,
    {
      message: 'password should contain at least one special character',
    },
  )
  @IsPresent('old_password')
  @IsPresent('confirm_password')
  new_password?: string;

  @IsString()
  @IsOptional()
  @Matches(
    /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/,
    {
      message: 'password should contain at least one special character',
    },
  )
  @IsPresent('old_password')
  @IsPresent('new_password')
  @Match('new_password')
  confirm_password?: string;
}
