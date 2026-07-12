import { ForbiddenException } from '@nestjs/common';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  type ProjectSearchFilter = {
    memberIds: { toString: () => string };
    name?: { $regex: string; $options: string };
  };

  let service: ProjectsService;
  const projectId = '66b3fcb8f152aa994acba001';
  const ownerId = '66b3fcb8f152aa994acba101';
  const memberId = '66b3fcb8f152aa994acba102';
  const outsiderId = '66b3fcb8f152aa994acba103';
  const projectModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    aggregate: jest.fn(),
  };
  const usersService = {
    findById: jest.fn(),
    findProfilesByIds: jest.fn(),
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
        ownerId,
        memberIds: [ownerId],
      }),
    });

    await expect(
      service.create(ownerId, {
        name: 'Website Redesign',
      }),
    ).resolves.toMatchObject({
      ownerId,
      memberIds: [ownerId],
    });
    const createCalls = projectModel.create.mock.calls as Array<[{
      name: string;
      description: string;
      ownerId: { toString: () => string };
      memberIds: Array<{ toString: () => string }>;
    }]>;
    const [createPayload] = createCalls[0];

    expect(createPayload.name).toBe('Website Redesign');
    expect(createPayload.description).toBe('');
    expect(createPayload.ownerId.toString()).toBe(ownerId);
    expect(createPayload.memberIds.map((id) => id.toString())).toEqual([ownerId]);
  });

  it('prevents non-owners from adding members', async () => {
    projectModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ownerId,
        memberIds: [ownerId],
      }),
    });

    await expect(
      service.addMember(projectId, outsiderId, memberId),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(usersService.findById).not.toHaveBeenCalled();
  });

  it('lists projects without member ids', async () => {
    const project = {
      toJSON: () => ({
        id: 'project-1',
        name: 'Website Redesign',
        description: '',
        ownerId,
        memberIds: [ownerId, memberId],
      }),
    };
    projectModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([project]),
          }),
        }),
      }),
    });
    projectModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    const response = await service.findAllForUser(ownerId, {});

    expect(response.data).toEqual([
      {
        id: 'project-1',
        name: 'Website Redesign',
        description: '',
        ownerId,
      },
    ]);
    expect(response.data[0]).not.toHaveProperty('memberIds');
  });

  it('filters listed projects by name search only', async () => {
    const project = {
      toJSON: () => ({
        id: 'project-1',
        name: 'Website Redesign',
        description: 'Mobile app discovery',
        ownerId,
        memberIds: [ownerId, memberId],
      }),
    };
    projectModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([project]),
          }),
        }),
      }),
    });
    projectModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    await service.findAllForUser(ownerId, { search: 'web.*site' });

    const [findFilter] = (projectModel.find as jest.Mock<unknown, [ProjectSearchFilter]>)
      .mock.calls[0];
    const [countFilter] = (
      projectModel.countDocuments as jest.Mock<unknown, [ProjectSearchFilter]>
    ).mock.calls[0];

    expect(findFilter.memberIds.toString()).toBe(ownerId);
    expect(findFilter.name).toEqual({ $regex: 'web\\.\\*site', $options: 'i' });
    expect(countFilter.memberIds.toString()).toBe(ownerId);
    expect(countFilter.name).toEqual({ $regex: 'web\\.\\*site', $options: 'i' });
  });

  it('returns project detail with expanded members', async () => {
    projectModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ownerId,
        memberIds: [ownerId, memberId],
        toJSON: () => ({
          id: projectId,
          name: 'Website Redesign',
          description: '',
          ownerId,
          memberIds: [ownerId, memberId],
        }),
      }),
    });
    projectModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          id: { toString: () => projectId },
          name: 'Website Redesign',
          description: '',
          ownerId: { toString: () => ownerId },
          members: [
            { id: { toString: () => ownerId }, name: 'Ada', email: 'ada@teamboard.dev' },
            {
              id: { toString: () => memberId },
              name: 'Grace',
              email: 'grace@teamboard.dev',
            },
          ],
        },
      ]),
    });

    await expect(
      service.findOneForMember(projectId, ownerId),
    ).resolves.toEqual({
      id: projectId,
      name: 'Website Redesign',
      description: '',
      ownerId,
      members: [
        { id: ownerId, name: 'Ada', email: 'ada@teamboard.dev' },
        { id: memberId, name: 'Grace', email: 'grace@teamboard.dev' },
      ],
    });
    expect(projectModel.aggregate).toHaveBeenCalled();
  });
});
