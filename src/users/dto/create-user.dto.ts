import { IsEmail, IsString, MinLength, IsNumber, Min, Max, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  fullName: string;

  @IsNumber()
  @Min(16)
  @Max(60)
  age: number;

  @IsString()
  @Matches(/^01\d{9}$/, {
    message: 'Mobile number must be 11 digits starting with 01',
  })
  mobileNumber: string;
}