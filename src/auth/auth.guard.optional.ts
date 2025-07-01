import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { AuthenticatedRequest } from './auth.controller';

interface JwtPayload {
    id: number;
    name: string;
    email: string;
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            request.user = undefined;
            return true;
        }
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(
                token,
                {
                    secret: jwtConstants.secret,
                },
            );
            request.user = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
