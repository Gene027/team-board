import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const userModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('creates a user and returns a public profile', async () => {
    userModel.create.mockResolvedValue({
      _id: { toString: () => 'user-1' },
      name: 'Ada Lovelace',
      email: 'ada@teamboard.dev',
      passwordHash: 'hashed-password',
    });

    await expect(
      service.createUser('Ada Lovelace', 'ada@teamboard.dev', 'hashed-password'),
    ).resolves.toEqual({
      id: 'user-1',
      name: 'Ada Lovelace',
      email: 'ada@teamboard.dev',
    });
    expect(userModel.create).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@teamboard.dev',
      passwordHash: 'hashed-password',
    });
  });

  it('looks up users by email with password hash selected', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    const select = jest.fn().mockReturnValue({ exec });
    userModel.findOne.mockReturnValue({ select });

    await expect(service.findByEmail('ada@teamboard.dev')).resolves.toBeNull();
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'ada@teamboard.dev',
    });
    expect(select).toHaveBeenCalledWith('+passwordHash');
    expect(exec).toHaveBeenCalled();
  });
});
