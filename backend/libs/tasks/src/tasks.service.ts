import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import {
  PaginatedResponse,
  TaskPriority,
  TaskStatus,
} from '@app/common';
import { ProjectsService } from '@app/projects';
import { AddTaskCommentDto } from './dto/add-task-comment.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';

type TaskUser = {
  id: string;
  name: string;
  email: string;
};

type TaskBaseResponse = Omit<
  Task,
  'projectId' | 'assigneeId' | 'createdById'
> & {
  id: string;
  projectId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TaskDetail = TaskBaseResponse & {
  assignee: TaskUser | null;
  assigner: TaskUser | null;
};

export type TaskListItem = Omit<TaskBaseResponse, 'comments'> & {
  assignee: TaskUser | null;
};

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(
    projectId: string,
    currentUserId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    await this.projectsService.ensureProjectMember(projectId, currentUserId);
    await this.validateAssignee(projectId, createTaskDto.assigneeId);

    const task = await this.taskModel.create({
      title: createTaskDto.title.trim(),
      description: createTaskDto.description?.trim() ?? '',
      status: createTaskDto.status ?? TaskStatus.Todo,
      priority: createTaskDto.priority ?? TaskPriority.Medium,
      projectId: this.toObjectId(projectId),
      assigneeId: createTaskDto.assigneeId
        ? this.toObjectId(createTaskDto.assigneeId)
        : null,
      createdById: this.toObjectId(currentUserId),
      comments: [],
    });

    return task.toJSON();
  }

  async findAllForProject(
    projectId: string,
    currentUserId: string,
    paginationQuery: { page?: number | string; limit?: number | string },
  ): Promise<PaginatedResponse<TaskListItem>> {
    await this.projectsService.ensureProjectMember(projectId, currentUserId);

    const { page, limit } = this.normalizePagination(paginationQuery);
    const skip = (page - 1) * limit;
    const filter = { projectId: this.toObjectId(projectId) };
    const pipeline: PipelineStage[] = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      ...this.assigneeLookupPipeline(),
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          projectId: { $toString: '$projectId' },
          createdAt: 1,
          updatedAt: 1,
          assignee: this.userProjection('$assigneeUser'),
        },
      },
    ];
    const [data, total] = await Promise.all([
      this.taskModel.aggregate<TaskListItem>(pipeline).exec(),
      this.taskModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    projectId: string,
    taskId: string,
    currentUserId: string,
  ): Promise<TaskDetail> {
    await this.projectsService.ensureProjectMember(projectId, currentUserId);
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: this.toObjectId(taskId),
          projectId: this.toObjectId(projectId),
        },
      },
      ...this.assigneeLookupPipeline(),
      {
        $lookup: {
          from: 'users',
          localField: 'createdById',
          foreignField: '_id',
          as: 'assignerUser',
        },
      },
      {
        $unwind: {
          path: '$assignerUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'comments.authorId',
          foreignField: '_id',
          as: 'commentAuthors',
        },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          title: 1,
          description: 1,
          status: 1,
          priority: 1,
          projectId: { $toString: '$projectId' },
          comments: this.commentsProjection(),
          createdAt: 1,
          updatedAt: 1,
          assignee: this.userProjection('$assigneeUser'),
          assigner: this.userProjection('$assignerUser'),
        },
      },
    ];
    const [task] = await this.taskModel.aggregate<TaskDetail>(pipeline).exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    projectId: string,
    taskId: string,
    currentUserId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    await this.projectsService.ensureProjectMember(projectId, currentUserId);
    await this.validateAssignee(projectId, updateTaskDto.assigneeId);

    const task = await this.findTaskInProjectOrThrow(projectId, taskId);

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title.trim();
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description.trim();
    }

    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
    }

    if (updateTaskDto.priority !== undefined) {
      task.priority = updateTaskDto.priority;
    }

    if (updateTaskDto.assigneeId !== undefined) {
      task.assigneeId = this.toObjectId(updateTaskDto.assigneeId);
    }

    const savedTask = await task.save();
    return savedTask.toJSON();
  }

  async remove(
    projectId: string,
    taskId: string,
    currentUserId: string,
  ): Promise<{ deleted: true }> {
    await this.projectsService.ensureProjectMember(projectId, currentUserId);
    const task = await this.findTaskInProjectOrThrow(projectId, taskId);
    await task.deleteOne();
    return { deleted: true };
  }

  async addComment(
    projectId: string,
    taskId: string,
    currentUserId: string,
    addTaskCommentDto: AddTaskCommentDto,
  ): Promise<Task> {
    await this.projectsService.ensureProjectMember(projectId, currentUserId);
    const task = await this.findTaskInProjectOrThrow(projectId, taskId);

    task.comments.push({
      body: addTaskCommentDto.body.trim(),
      authorId: this.toObjectId(currentUserId),
      createdAt: new Date(),
    });

    const savedTask = await task.save();
    return savedTask.toJSON();
  }

  private async validateAssignee(
    projectId: string,
    assigneeId?: string,
  ): Promise<void> {
    if (!assigneeId) {
      return;
    }

    await this.projectsService.ensureUsersAreProjectMembers(projectId, [assigneeId]);
  }

  private async findTaskInProjectOrThrow(
    projectId: string,
    taskId: string,
  ): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOne({
        _id: this.toObjectId(taskId),
        projectId: this.toObjectId(projectId),
      })
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private assigneeLookupPipeline(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'assigneeId',
          foreignField: '_id',
          as: 'assigneeUser',
        },
      },
      {
        $unwind: {
          path: '$assigneeUser',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  private userProjection(userPath: string): Record<string, unknown> {
    return {
      $cond: [
        { $ifNull: [`${userPath}._id`, false] },
        {
          id: { $toString: `${userPath}._id` },
          name: `${userPath}.name`,
          email: `${userPath}.email`,
        },
        null,
      ],
    };
  }

  private commentsProjection(): Record<string, unknown> {
    return {
      $map: {
        input: { $ifNull: ['$comments', []] },
        as: 'comment',
        in: {
          id: { $toString: '$$comment._id' },
          body: '$$comment.body',
          authorId: { $toString: '$$comment.authorId' },
          author: {
            $let: {
              vars: {
                author: {
                  $first: {
                    $filter: {
                      input: '$commentAuthors',
                      as: 'commentAuthor',
                      cond: {
                        $eq: ['$$commentAuthor._id', '$$comment.authorId'],
                      },
                    },
                  },
                },
              },
              in: this.userProjection('$$author'),
            },
          },
          createdAt: '$$comment.createdAt',
        },
      },
    };
  }

  private normalizePagination(paginationQuery: {
    page?: number | string;
    limit?: number | string;
  }): { page: number; limit: number } {
    const page = Number(paginationQuery.page);
    const limit = Number(paginationQuery.limit);

    return {
      page: Number.isInteger(page) && page > 0 ? page : 1,
      limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 20,
    };
  }

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    return new Types.ObjectId(id);
  }
}
