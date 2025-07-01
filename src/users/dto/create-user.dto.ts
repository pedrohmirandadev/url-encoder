import { IsNotEmpty, IsEmail, IsString, MinLength } from '@nestjs/class-validator';
import { IsStrongPassword } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;
}
