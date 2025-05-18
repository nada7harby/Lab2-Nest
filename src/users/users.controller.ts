import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiBody({ type: CreateUserDto })
  async signUp(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    const user = await this.usersService.create(createUserDto);
    const token = await this.usersService.generateToken(user);
    return { user, token };
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginUserDto })
  async signIn(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(loginUserDto);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const token = await this.usersService.generateToken(user);
    return { user, token };
  }

  @Get('my-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user.sub);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users excluding authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns list of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllUsers(@Req() req) {
    return this.usersService.findAllExcluding(req.user.sub);
  }
}