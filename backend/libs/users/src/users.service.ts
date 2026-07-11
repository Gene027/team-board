import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  toProfile(user: UserDocument): UserProfile {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  }
}
