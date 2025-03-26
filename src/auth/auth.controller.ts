import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponse } from './types';

interface AuthResponse {
  access_token: string;
  user: UserResponse;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginData: { email: string; password: string },
  ): Promise<AuthResponse> {
    const user = await this.authService.validateUser(
      loginData.email,
      loginData.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.register(createUserDto);
  }
}
