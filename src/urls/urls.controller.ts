import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
    NotFoundException,
    UseGuards,
    Req,
} from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { OptionalAuthGuard } from 'src/auth/auth.guard.optional';

@Controller()
export class UrlController {
    constructor(private readonly urlService: UrlService) { }

    @Post('urls')
    @UseGuards(OptionalAuthGuard)
    create(
        @Body() createUrlDto: CreateUrlDto,
        @Req() req: Request & { user?: { id: number } },
    ) {
        return this.urlService.create(
            createUrlDto,
            req.user ? req.user.id : undefined,
        );
    }

    @UseGuards(AuthGuard)
    @Get('urls')
    findAll() {
        return this.urlService.findAll();
    }

    @Get(':code')
    async redirect(@Param('code') code: string, @Res() res: Response) {
        const url = await this.urlService.findByCode(code);
        if (!url) throw new NotFoundException('URL not found');
        return res.redirect(url.url);
    }

    @UseGuards(AuthGuard)
    @Patch('urls/:id')
    update(@Param('id') id: string, @Body() updateUrlDto: UpdateUrlDto) {
        return this.urlService.update(+id, updateUrlDto);
    }

    @UseGuards(AuthGuard)
    @Delete('urls/:id')
    remove(@Param('id') id: string) {
        return this.urlService.remove(+id);
    }
}
