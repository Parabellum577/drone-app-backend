import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.register(createUserDto);
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Check if email is available' })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Email to check',
    example: 'user@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Email availability status',
    schema: {
      properties: {
        available: { type: 'boolean' },
      },
    },
  })
  @Get('check-email')
  async checkEmailAvailability(
    @Query('email') email: string,
  ): Promise<{ available: boolean }> {
    const available = await this.usersService.checkEmailAvailability(email);
    return { available };
  }

  @ApiOperation({ summary: 'Check if username is available' })
  @ApiQuery({
    name: 'username',
    required: true,
    description: 'Username to check',
    example: 'johndoe',
  })
  @ApiResponse({
    status: 200,
    description: 'Username availability status',
    schema: {
      properties: {
        available: { type: 'boolean' },
      },
    },
  })
  @Get('check-username')
  async checkUsernameAvailability(
    @Query('username') username: string,
  ): Promise<{ available: boolean }> {
    const available =
      await this.usersService.checkUsernameAvailability(username);
    return { available };
  }
}
