import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginatedResponse } from '@app/common';
import { UserProfile, UsersService } from '@app/users';
import { Task, TaskDocument } from '../../tasks/src/schemas/task.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  ProjectDetail,
  ProjectListItem,
} from './interfaces/project-responses.interface';
import { Project, ProjectDocument } from './schemas/project.schema';

type SerializedProject = Project & {
  id: string;
  ownerId: Types.ObjectId | string;
  memberIds: Array<Types.ObjectId | string>;
  createdAt?: Date;
  updatedAt?: Date;
};

type ProjectDetailAggregate = {
  id: Types.ObjectId;
  name: string;
  description: string;
  ownerId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  members: Array<{
    id: Types.ObjectId;
    name: string;
    email: string;
  }>;
};

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    ownerId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const project = await this.projectModel.create({
      name: createProjectDto.name.trim(),
      description: createProjectDto.description?.trim() ?? '',
      ownerId: this.toObjectId(ownerId),
      memberIds: [this.toObjectId(ownerId)],
    });

    return project.toJSON();
  }

  async findAllForUser(
    userId: string,
    paginationQuery: { page?: number | string; limit?: number | string; search?: string },
  ): Promise<PaginatedResponse<ProjectListItem>> {
    const { page, limit } = this.normalizePagination(paginationQuery);
    const skip = (page - 1) * limit;
    const filter: {
      memberIds: Types.ObjectId;
      name?: { $regex: string; $options: string };
    } = { memberIds: this.toObjectId(userId) };
    const search = paginationQuery.search?.trim();

    if (search) {
      filter.name = { $regex: this.escapeRegex(search), $options: 'i' };
    }

    const [projects, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    return {
      data: projects.map((project) => this.toListItem(project)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneForMember(
    projectId: string,
    userId: string,
  ): Promise<ProjectDetail> {
    const project = await this.findProjectOrThrow(projectId);
    this.assertProjectMember(project, userId);
    return this.findProjectDetailOrThrow(projectId);
  }

  async update(
    projectId: string,
    userId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findProjectOrThrow(projectId);
    this.assertProjectOwner(project, userId);

    if (updateProjectDto.name !== undefined) {
      project.name = updateProjectDto.name.trim();
    }

    if (updateProjectDto.description !== undefined) {
      project.description = updateProjectDto.description.trim();
    }

    const savedProject = await project.save();
    return savedProject.toJSON();
  }

  async remove(projectId: string, userId: string): Promise<{ deleted: true }> {
    const project = await this.findProjectOrThrow(projectId);
    this.assertProjectOwner(project, userId);
    await project.deleteOne();
    return { deleted: true };
  }

  async addMember(
    projectId: string,
    ownerId: string,
    memberId: string,
  ): Promise<Project> {
    const project = await this.findProjectOrThrow(projectId);
    this.assertProjectOwner(project, ownerId);

    const user = await this.usersService.findById(memberId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await project
      .updateOne({ $addToSet: { memberIds: this.toObjectId(memberId) } })
      .exec();
    const updatedProject = await this.findProjectOrThrow(projectId);
    return updatedProject.toJSON();
  }

  async removeMember(
    projectId: string,
    ownerId: string,
    memberId: string,
  ): Promise<Project> {
    const project = await this.findProjectOrThrow(projectId);
    this.assertProjectOwner(project, ownerId);

    if (this.idsEqual(project.ownerId, memberId)) {
      throw new ConflictException('Project owner cannot be removed');
    }

    project.memberIds = project.memberIds.filter((id) => !this.idsEqual(id, memberId));
    const savedProject = await project.save();
    await this.taskModel
      .updateMany(
        {
          projectId: this.toObjectId(projectId),
          assigneeId: this.toObjectId(memberId),
        },
        { $set: { assigneeId: null } },
      )
      .exec();
    return savedProject.toJSON();
  }

  async ensureProjectMember(
    projectId: string,
    userId: string,
  ): Promise<ProjectDocument> {
    const project = await this.findProjectOrThrow(projectId);
    this.assertProjectMember(project, userId);
    return project;
  }

  async ensureUsersAreProjectMembers(
    projectId: string,
    userIds: string[],
  ): Promise<ProjectDocument> {
    const project = await this.findProjectOrThrow(projectId);
    const missingUserId = userIds.find((userId) => !this.hasMember(project, userId));

    if (missingUserId) {
      throw new ForbiddenException('User is not a project member');
    }

    return project;
  }

  async findMemberIdsForProject(
    projectId: string,
    currentUserId: string,
  ): Promise<string[]> {
    const project = await this.ensureProjectMember(projectId, currentUserId);
    return project.memberIds.map((memberId) => memberId.toString());
  }

  async findMembersForProject(
    projectId: string,
    currentUserId: string,
    paginationQuery: { page?: number | string; limit?: number | string },
  ): Promise<PaginatedResponse<UserProfile>> {
    const memberIds = await this.findMemberIdsForProject(projectId, currentUserId);
    return this.usersService.findAll({
      ...paginationQuery,
      userIds: memberIds,
    });
  }

  private async findProjectOrThrow(projectId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(this.toObjectId(projectId)).exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private assertProjectMember(project: ProjectDocument, userId: string): void {
    if (!this.hasMember(project, userId)) {
      throw new ForbiddenException('User is not a project member');
    }
  }

  private assertProjectOwner(project: ProjectDocument, userId: string): void {
    if (!this.idsEqual(project.ownerId, userId)) {
      throw new ForbiddenException('Only the project owner can perform this action');
    }
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

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private toListItem(project: ProjectDocument): ProjectListItem {
    const json = project.toJSON() as unknown as SerializedProject;

    return {
      id: json.id,
      name: json.name,
      description: json.description,
      ownerId: json.ownerId.toString(),
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    };
  }

  private async findProjectDetailOrThrow(projectId: string): Promise<ProjectDetail> {
    const [project] = await this.projectModel
      .aggregate<ProjectDetailAggregate>([
        { $match: { _id: this.toObjectId(projectId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
          },
        },
        {
          $project: {
            id: '$_id',
            name: 1,
            description: 1,
            ownerId: 1,
            createdAt: 1,
            updatedAt: 1,
            members: {
              $map: {
                input: '$members',
                as: 'member',
                in: {
                  id: '$$member._id',
                  name: '$$member.name',
                  email: '$$member.email',
                },
              },
            },
          },
        },
      ])
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return {
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      ownerId: project.ownerId.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      members: project.members.map((member) => ({
        id: member.id.toString(),
        name: member.name,
        email: member.email,
      })),
    };
  }

  private hasMember(project: ProjectDocument, userId: string): boolean {
    return project.memberIds.some((memberId) => this.idsEqual(memberId, userId));
  }

  private idsEqual(left: Types.ObjectId | string, right: Types.ObjectId | string): boolean {
    return left.toString() === right.toString();
  }

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    return new Types.ObjectId(id);
  }
}
