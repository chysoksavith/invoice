import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service.js'
import { LoginDto } from './dto/login.dto.js'
import { RegisterDto } from './dto/register.dto.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email, true)
    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    // Node bcrypt expects $2a$ or $2b$ instead of Laravel's $2y$ prefix
    const normalizedHash = user.password.replace(/^\$2y\$/, '$2a$')
    const isMatch = await bcrypt.compare(pass, normalizedHash)

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const { password, ...result } = user
    return result
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password)
    const payload = { sub: user.id, email: user.email }
    const token = this.jwtService.sign(payload)

    return {
      access_token: token,
      token,
      user,
    }
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email)
    if (existing) {
      throw new BadRequestException('Email already in use')
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10)
    const newUser = await this.usersService.create({
      name: registerDto.name || registerDto.email.split('@')[0],
      email: registerDto.email,
      password: hashedPassword,
    })

    const { password, ...user } = newUser
    const payload = { sub: user.id, email: user.email }
    const token = this.jwtService.sign(payload)

    return {
      access_token: token,
      token,
      user,
    }
  }
}
