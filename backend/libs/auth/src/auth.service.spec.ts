import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@app/users';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'createUser' | 'findByEmail' | 'toProfile'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(() => {
    usersService = {
      createUser: jest.fn(),
      findByEmail: jest.fn(),
      toProfile: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed.jwt.token'),
    };

    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('signs up a new user with a hashed password and token', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.createUser.mockResolvedValue({
      id: 'user-1',
      name: 'Ada Lovelace',
      email: 'ada@teamboard.dev',
    });

    const response = await service.signup({
      name: 'Ada Lovelace',
      email: ' ADA@TeamBoard.dev ',
      password: 'password123',
    });

    const createdPasswordHash = usersService.createUser.mock.calls[0][2];

    expect(usersService.findByEmail).toHaveBeenCalledWith('ada@teamboard.dev');
    expect(usersService.createUser).toHaveBeenCalledWith(
      'Ada Lovelace',
      'ada@teamboard.dev',
      expect.any(String),
    );
    expect(createdPasswordHash).not.toBe('password123');
    await expect(bcrypt.compare('password123', createdPasswordHash)).resolves.toBe(
      true,
    );
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'ada@teamboard.dev',
    });
    expect(response).toEqual({
      accessToken: 'signed.jwt.token',
      user: {
        id: 'user-1',
        name: 'Ada Lovelace',
        email: 'ada@teamboard.dev',
      },
    });
  });

  it('rejects duplicate signup emails', async () => {
    usersService.findByEmail.mockResolvedValue({
      _id: { toString: () => 'user-1' },
      name: 'Ada Lovelace',
      email: 'ada@teamboard.dev',
      passwordHash: 'hash',
    } as never);

    await expect(
      service.signup({
        name: 'Ada Lovelace',
        email: 'ada@teamboard.dev',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.createUser).not.toHaveBeenCalled();
  });

  it('logs in a user with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const userDocument = {
      _id: { toString: () => 'user-1' },
      name: 'Ada Lovelace',
      email: 'ada@teamboard.dev',
      passwordHash,
    };

    usersService.findByEmail.mockResolvedValue(userDocument as never);
    usersService.toProfile.mockReturnValue({
      id: 'user-1',
      name: 'Ada Lovelace',
      email: 'ada@teamboard.dev',
    });

    const response = await service.login({
      email: 'ada@teamboard.dev',
      password: 'password123',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith('ada@teamboard.dev');
    expect(usersService.toProfile).toHaveBeenCalledWith(userDocument);
    expect(response.accessToken).toBe('signed.jwt.token');
  });

  it('rejects invalid login credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@teamboard.dev',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
