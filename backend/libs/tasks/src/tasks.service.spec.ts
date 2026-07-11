import { ForbiddenException } from '@nestjs/common';
import { TaskStatus } from '@app/common';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  const taskModel = {
    findOne: jest.fn(),
  };
  const projectsService = {
    ensureProjectMember: jest.fn(),
    ensureUsersAreProjectMembers: jest.fn(),
  };

  beforeEach(() => {
    service = new TasksService(taskModel as never, projectsService as never);
    jest.clearAllMocks();
  });

  it('requires assignee to be a project member', async () => {
    projectsService.ensureProjectMember.mockResolvedValue({ id: 'project-1' });
    projectsService.ensureUsersAreProjectMembers.mockRejectedValue(
      new ForbiddenException('User is not a project member'),
    );

    await expect(
      service.create('project-1', 'user-1', {
        title: 'Design dashboard',
        assigneeId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates task status for a project member', async () => {
    const save = jest.fn().mockResolvedValue({
      toJSON: () => ({ id: 'task-1', status: TaskStatus.Blocked }),
    });
    const task = {
      status: TaskStatus.Todo,
      save,
    };
    projectsService.ensureProjectMember.mockResolvedValue({ id: 'project-1' });
    taskModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(task),
    });

    await expect(
      service.update('project-1', 'task-1', 'user-1', {
        status: TaskStatus.Blocked,
      }),
    ).resolves.toMatchObject({ status: TaskStatus.Blocked });
    expect(task.status).toBe(TaskStatus.Blocked);
  });

  it('adds a comment for a project member', async () => {
    const save = jest.fn().mockResolvedValue({
      toJSON: () => ({
        id: 'task-1',
        comments: [{ body: 'Looks good', authorId: 'user-1' }],
      }),
    });
    const task = {
      comments: [],
      save,
    };
    projectsService.ensureProjectMember.mockResolvedValue({ id: 'project-1' });
    taskModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(task),
    });

    await expect(
      service.addComment('project-1', 'task-1', 'user-1', {
        body: 'Looks good',
      }),
    ).resolves.toMatchObject({
      comments: [{ body: 'Looks good', authorId: 'user-1' }],
    });
    expect(task.comments).toHaveLength(1);
  });
});
