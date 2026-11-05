import { Controller, Get, Param, UseGuards, ParseIntPipe, NotFoundException } from '@nestjs/common'
import { UsersService } from './users.service.js'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id)
    if (!user) {
      throw new NotFoundException(`User #${id} not found`)
    }
    return user
  }
}
