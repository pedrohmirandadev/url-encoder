import {
    Controller,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    Req,
    ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from '../auth/auth.controller';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    update(
        @Param('id') id: number,
        @Body() updateUserDto: UpdateUserDto,
        @Req() req: AuthenticatedRequest,
    ) {
        if (req.user!.id !== id) {
            throw new ForbiddenException(
                'You are not authorized to update this user',
            );
        }
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    remove(@Param('id') id: number, @Req() req: AuthenticatedRequest) {
        if (req.user!.id !== id) {
            throw new ForbiddenException(
                'You are not authorized to delete this user',
            );
        }
        return this.usersService.remove(id);
    }
}
