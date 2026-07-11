import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginatedResponse } from '@app/common';
import { UserProfile } from './interfaces/user-profile.interface';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<UserProfile> {
    const user = await this.userModel.create({ name, email, passwordHash });
    return this.toProfile(user);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+passwordHash').exec();
  }

  async findById(id: string): Promise<UserProfile | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.toProfile(user) : null;
  }

  async findProfilesByIds(ids: string[]): Promise<UserProfile[]> {
    const users = await this.userModel.find({ _id: { $in: ids } }).exec();
    return users.map((user) => this.toProfile(user));
  }

  async findAll(options: {
    page?: number | string;
    limit?: number | string;
    userIds?: string[];
  }): Promise<PaginatedResponse<UserProfile>> {
    const { page, limit } = this.normalizePagination(options);
    const skip = (page - 1) * limit;
    const filter = options.userIds
      ? { _id: { $in: options.userIds.map((id) => this.toObjectId(id)) } }
      : {};
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ name: 1, email: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data: users.map((user) => this.toProfile(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  toProfile(user: UserDocument): UserProfile {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  }

  private normalizePagination(options: {
    page?: number | string;
    limit?: number | string;
  }): { page: number; limit: number } {
    const page = Number(options.page);
    const limit = Number(options.limit);

    return {
      page: Number.isInteger(page) && page > 0 ? page : 1,
      limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 20,
    };
  }

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}
