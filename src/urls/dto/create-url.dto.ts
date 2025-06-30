import { IsNotEmpty, IsUrl } from '@nestjs/class-validator';

export class CreateUrlDto {
    @IsUrl()
    @IsNotEmpty()
    url: string;
}
