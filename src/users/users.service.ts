import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResourceNotFoundException } from '../common/exceptions/resource-not-found.exception';

export interface PaginatedUsersResult {
  data: UserDocument[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUsersResult> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ResourceNotFoundException('User', id);
    }

    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new ResourceNotFoundException('User', id);
    }

    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<UserDocument> {
    const { email } = loginUserDto;

    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new ResourceNotFoundException('User', `with email ${email}`);
    }

    return user;
  }

  async searchUsers(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedUsersResult> {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i');

    const filter = {
      $or: [{ name: searchRegex }, { email: searchRegex }],
    };

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
