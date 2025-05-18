import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<User | null> {
    const user = await this.findByEmail(loginUserDto.email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    return isPasswordValid ? user : null;
  }

  async generateToken(user: User): Promise<string> {
    const payload = { email: user.email, sub: user._id };
    return this.jwtService.sign(payload);
  }

  async findAllExcluding(userId: string): Promise<User[]> {
    return this.userModel.find({ _id: { $ne: userId } }).exec();
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }
}