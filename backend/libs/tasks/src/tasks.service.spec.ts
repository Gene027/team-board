import { ForbiddenException } from '@nestjs/common';
import { TaskStatus } from '@app/common';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  const projectId = '66b3fcb8f152aa994acba001';
  const taskId = '66b3fcb8f152aa994acba201';
  const userId = '66b3fcb8f152aa994acba101';
  const assigneeId = '66b3fcb8f152aa994acba102';
  const taskModel = {
    findOne: jest.fn(),
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
  };
  const projectsService = {
    ensureProjectMember: jest.fn(),
    ensureUsersAreProjectMembers: jest.fn(),
  };

  beforeEach(() => {
    service = new TasksService(
      taskModel as never,
      projectsService as never,
    );
    jest.clearAllMocks();
  });

  it('includes assignee details when listing project tasks', async () => {
    projectsService.ensureProjectMember.mockResolvedValue({ id: projectId });
    taskModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          id: taskId,
          title: 'Design dashboard',
          assignee: {
            id: assigneeId,
            name: 'Ada Lovelace',
            email: 'ada@example.com',
          },
        },
      ]),
    });
    taskModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    const result = await service.findAllForProject(projectId, userId, {});

    expect(result).toMatchObject({
      data: [
        {
          id: taskId,
          title: 'Design dashboard',
          assignee: {
            id: assigneeId,
            name: 'Ada Lovelace',
            email: 'ada@example.com',
          },
        },
      ],
    });
    expect(result.data[0]).not.toHaveProperty('assigneeId');
    expect(result.data[0]).not.toHaveProperty('createdById');
    expect(result.data[0]).not.toHaveProperty('createdBy');
    expect(result.data[0]).not.toHaveProperty('comments');
    expect(taskModel.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $lookup: expect.objectContaining({
            from: 'users',
            localField: 'assigneeId',
          }),
        }),
      ]),
    );
  });

  it('includes assigner, assignee, and comments when getting task details', async () => {
    projectsService.ensureProjectMember.mockResolvedValue({ id: projectId });
    taskModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          id: taskId,
          title: 'Design dashboard',
          assignee: {
            id: assigneeId,
            name: 'Ada Lovelace',
            email: 'ada@example.com',
          },
          assigner: {
            id: userId,
            name: 'Grace Hopper',
            email: 'grace@example.com',
          },
          comments: [
            {
              id: 'comment-1',
              body: 'Looks good',
              authorId: userId,
              author: {
                id: userId,
                name: 'Grace Hopper',
                email: 'grace@example.com',
              },
            },
          ],
        },
      ]),
    });

    const result = await service.findOne(projectId, taskId, userId);

    expect(result).toMatchObject({
      id: taskId,
      title: 'Design dashboard',
      assignee: {
        id: assigneeId,
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
      assigner: {
        id: userId,
        name: 'Grace Hopper',
        email: 'grace@example.com',
      },
      comments: [
        {
          id: 'comment-1',
          body: 'Looks good',
          authorId: userId,
          author: {
            id: userId,
            name: 'Grace Hopper',
            email: 'grace@example.com',
          },
        },
      ],
    });
    expect(result).not.toHaveProperty('assigneeId');
    expect(result).not.toHaveProperty('createdById');
    expect(result).not.toHaveProperty('createdBy');
    expect(taskModel.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $lookup: expect.objectContaining({
            from: 'users',
            localField: 'assigneeId',
          }),
        }),
        expect.objectContaining({
          $lookup: expect.objectContaining({
            from: 'users',
            localField: 'createdById',
          }),
        }),
        expect.objectContaining({
          $lookup: expect.objectContaining({
            from: 'users',
            localField: 'comments.authorId',
          }),
        }),
      ]),
    );
  });

  it('requires assignee to be a project member', async () => {
    projectsService.ensureProjectMember.mockResolvedValue({ id: projectId });
    projectsService.ensureUsersAreProjectMembers.mockRejectedValue(
      new ForbiddenException('User is not a project member'),
    );

    await expect(
      service.create(projectId, userId, {
        title: 'Design dashboard',
        assigneeId,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates task status for a project member', async () => {
    const save = jest.fn().mockResolvedValue({
      toJSON: () => ({ id: taskId, status: TaskStatus.Blocked }),
    });
    const task = {
      status: TaskStatus.Todo,
      save,
    };
    projectsService.ensureProjectMember.mockResolvedValue({ id: projectId });
    taskModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(task),
    });

    await expect(
      service.update(projectId, taskId, userId, {
        status: TaskStatus.Blocked,
      }),
    ).resolves.toMatchObject({ status: TaskStatus.Blocked });
    expect(task.status).toBe(TaskStatus.Blocked);
  });

  it('adds a comment for a project member', async () => {
    const save = jest.fn().mockResolvedValue({
      toJSON: () => ({
        id: taskId,
        comments: [{ body: 'Looks good', authorId: userId }],
      }),
    });
    const task = {
      comments: [],
      save,
    };
    projectsService.ensureProjectMember.mockResolvedValue({ id: projectId });
    taskModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(task),
    });

    await expect(
      service.addComment(projectId, taskId, userId, {
        body: 'Looks good',
      }),
    ).resolves.toMatchObject({
      comments: [{ body: 'Looks good', authorId: userId }],
    });
    expect(task.comments).toHaveLength(1);
  });
});
