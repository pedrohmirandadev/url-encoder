import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    UseGuards,
    Get,
    Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: { id: number; email: string; name: string };
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: { email: string; password: string }) {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }

    @Get('me')
    @UseGuards(AuthGuard)
    getProfile(@Req() request: AuthenticatedRequest) {
        const userId = Number(request.user?.id);
        return this.authService.findByUserId(userId);
    }
}
