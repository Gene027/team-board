import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const userModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
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

  it('lists paginated users', async () => {
    const user = {
      _id: { toString: () => '66b3fcb8f152aa994acba101' },
      name: 'Ada Lovelace',
      email: 'ada@teamboard.dev',
    };
    userModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([user]),
          }),
        }),
      }),
    });
    userModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    await expect(service.findAll({})).resolves.toEqual({
      data: [
        {
          id: '66b3fcb8f152aa994acba101',
          name: 'Ada Lovelace',
          email: 'ada@teamboard.dev',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });
    expect(userModel.find).toHaveBeenCalledWith({});
  });

  it('filters users by ids when provided', async () => {
    userModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
    userModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });

    await service.findAll({
      userIds: ['66b3fcb8f152aa994acba101'],
    });

    const findCalls = userModel.find.mock.calls as Array<[{
      _id: { $in: Array<{ toString: () => string }> };
    }]>;
    const [filter] = findCalls[0];
    expect(filter._id.$in.map((id) => id.toString())).toEqual([
      '66b3fcb8f152aa994acba101',
    ]);
  });
});
