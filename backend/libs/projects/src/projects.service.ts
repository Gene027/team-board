import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResponse, PaginationQueryDto } from '@app/common';
import { UsersService } from '@app/users';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    ownerId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const project = await this.projectModel.create({
      name: createProjectDto.name.trim(),
      description: createProjectDto.description?.trim() ?? '',
      ownerId,
      memberIds: [ownerId],
    });

    return project.toJSON();
  }

  async findAllForUser(
    userId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Project>> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;
    const filter = { memberIds: userId };
    const [projects, total] = await Promise.all([
      this.projectModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    return {
      data: projects.map((project) => project.toJSON() as Project),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneForMember(projectId: string, userId: string): Promise<Project> {
    const project = await this.findProjectOrThrow(projectId);
    this.assertProjectMember(project, userId);
    return project.toJSON();
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

    if (!project.memberIds.includes(memberId)) {
      project.memberIds.push(memberId);
      await project.save();
    }

    return project.toJSON();
  }

  async removeMember(
    projectId: string,
    ownerId: string,
    memberId: string,
  ): Promise<Project> {
    const project = await this.findProjectOrThrow(projectId);
    this.assertProjectOwner(project, ownerId);

    if (project.ownerId === memberId) {
      throw new ConflictException('Project owner cannot be removed');
    }

    project.memberIds = project.memberIds.filter((id) => id !== memberId);
    const savedProject = await project.save();
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
    const missingUserId = userIds.find((userId) => !project.memberIds.includes(userId));

    if (missingUserId) {
      throw new ForbiddenException('User is not a project member');
    }

    return project;
  }

  private async findProjectOrThrow(projectId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(projectId).exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private assertProjectMember(project: ProjectDocument, userId: string): void {
    if (!project.memberIds.includes(userId)) {
      throw new ForbiddenException('User is not a project member');
    }
  }

  private assertProjectOwner(project: ProjectDocument, userId: string): void {
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can perform this action');
    }
  }
}
