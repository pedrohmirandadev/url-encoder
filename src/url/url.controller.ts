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
} from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';

@Controller()
export class UrlController {
    constructor(private readonly urlService: UrlService) {}

    @Post('url')
    create(@Body() createUrlDto: CreateUrlDto) {
        return this.urlService.create(createUrlDto);
    }

    @Get('url')
    findAll() {
        return this.urlService.findAll();
    }

    @Get(':code')
    async redirect(@Param('code') code: string, @Res() res: Response) {
        const url = await this.urlService.findByCode(code);
        if (!url) throw new NotFoundException('URL not found');
        return res.redirect(url.url);
    }

    @Patch('url/:id')
    update(@Param('id') id: string, @Body() updateUrlDto: UpdateUrlDto) {
        return this.urlService.update(+id, updateUrlDto);
    }

    @Delete('url/:id')
    remove(@Param('id') id: string) {
        return this.urlService.remove(+id);
    }
}
