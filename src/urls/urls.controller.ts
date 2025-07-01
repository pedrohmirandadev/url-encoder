import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
    UseGuards,
    Req,
} from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { OptionalAuthGuard } from 'src/auth/auth.guard.optional';
import { AuthenticatedRequest } from 'src/auth/auth.controller';

@Controller()
export class UrlController {
    constructor(private readonly urlService: UrlService) { }

    @Post('urls')
    @UseGuards(OptionalAuthGuard)
    create(
        @Body() createUrlDto: CreateUrlDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.urlService.create(
            createUrlDto,
            req.user ? req.user.id : undefined,
        );
    }

    @Get('urls')
    @UseGuards(AuthGuard)
    findAll(@Req() req: AuthenticatedRequest) {
        return this.urlService.findManyByUser(req.user!.id);
    }

    @Get(':code')
    async redirectAndTrackVisitByCode(
        @Param('code') code: string,
        @Res() res: Response,
    ) {
        const url = await this.urlService.findAndTrackVisitByCode(code);
        return res.redirect(url.url);
    }

    @Patch('urls/:id')
    @UseGuards(AuthGuard)
    update(
        @Param('id') id: number,
        @Body() updateUrlDto: UpdateUrlDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.urlService.update(id, updateUrlDto, req.user!.id);
    }

    @Delete('urls/:id')
    @UseGuards(AuthGuard)
    remove(@Param('id') id: number, @Req() req: AuthenticatedRequest) {
        return this.urlService.remove(id, req.user!.id);
    }
}
