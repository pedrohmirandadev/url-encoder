import { IsNotEmpty } from '@nestjs/class-validator';
import { IsStrongPassword } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    email: string;

    @IsStrongPassword()
    password: string;
}
