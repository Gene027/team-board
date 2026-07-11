import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaginatedResponse,
  PaginationQueryDto,
  TaskPriority,
  TaskStatus,
} from '@app/common';
import { ProjectsService } from '@app/projects';
import { AddTaskCommentDto } from './dto/add-task-comment.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';

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
      projectId,
      assigneeId: createTaskDto.assigneeId ?? null,
      createdById: currentUserId,
      comments: [],
    });

    return task.toJSON();
  }

  async findAllForProject(
    projectId: string,
    currentUserId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Task>> {
    await this.projectsService.ensureProjectMember(projectId, currentUserId);

    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;
    const filter = { projectId };
    const [tasks, total] = await Promise.all([
      this.taskModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.taskModel.countDocuments(filter).exec(),
    ]);

    return {
      data: tasks.map((task) => task.toJSON() as Task),
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
  ): Promise<Task> {
    await this.projectsService.ensureProjectMember(projectId, currentUserId);
    const task = await this.findTaskInProjectOrThrow(projectId, taskId);
    return task.toJSON();
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
      task.assigneeId = updateTaskDto.assigneeId;
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
      authorId: currentUserId,
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
    const task = await this.taskModel.findOne({ _id: taskId, projectId }).exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}
