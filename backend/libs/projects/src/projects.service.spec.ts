import { ForbiddenException } from '@nestjs/common';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  const projectModel = {
    create: jest.fn(),
    findById: jest.fn(),
  };
  const usersService = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    service = new ProjectsService(projectModel as never, usersService as never);
    jest.clearAllMocks();
  });

  it('creates a project with creator as owner and member', async () => {
    projectModel.create.mockResolvedValue({
      toJSON: () => ({
        id: 'project-1',
        name: 'Website Redesign',
        description: '',
        ownerId: 'user-1',
        memberIds: ['user-1'],
      }),
    });

    await expect(
      service.create('user-1', {
        name: 'Website Redesign',
      }),
    ).resolves.toMatchObject({
      ownerId: 'user-1',
      memberIds: ['user-1'],
    });
    expect(projectModel.create).toHaveBeenCalledWith({
      name: 'Website Redesign',
      description: '',
      ownerId: 'user-1',
      memberIds: ['user-1'],
    });
  });

  it('prevents non-owners from adding members', async () => {
    projectModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ownerId: 'owner-1',
        memberIds: ['owner-1'],
      }),
    });

    await expect(
      service.addMember('project-1', 'user-2', 'user-3'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(usersService.findById).not.toHaveBeenCalled();
  });
});
