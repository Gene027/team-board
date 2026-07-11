import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthenticatedUser,
  CurrentUser,
  JwtAuthGuard,
} from '@app/common';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  @ApiCreatedResponse({ description: 'Project created' })
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(currentUser.id, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'List projects for the current user' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Projects returned' })
  findAll(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.findAllForUser(currentUser.id, { page, limit });
  }

  @Get(':projectId/members')
  @ApiOperation({ summary: 'List members in a project' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Project members returned' })
  @ApiForbiddenResponse({ description: 'Current user is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findMembers(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.findMembersForProject(projectId, currentUser.id, {
      page,
      limit,
    });
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiOkResponse({ description: 'Project returned' })
  @ApiForbiddenResponse({ description: 'Current user is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findOne(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.findOneForMember(projectId, currentUser.id);
  }

  @Patch(':projectId')
  @ApiOperation({ summary: 'Update a project' })
  @ApiOkResponse({ description: 'Project updated' })
  @ApiForbiddenResponse({ description: 'Only the owner can update a project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(projectId, currentUser.id, updateProjectDto);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiOkResponse({ description: 'Project deleted' })
  @ApiForbiddenResponse({ description: 'Only the owner can delete a project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.remove(projectId, currentUser.id);
  }

  @Post(':projectId/members')
  @ApiOperation({ summary: 'Add a member to a project' })
  @ApiOkResponse({ description: 'Member added or already present' })
  @ApiForbiddenResponse({ description: 'Only the owner can add members' })
  @ApiNotFoundResponse({ description: 'Project or user not found' })
  addMember(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Body() addProjectMemberDto: AddProjectMemberDto,
  ) {
    return this.projectsService.addMember(
      projectId,
      currentUser.id,
      addProjectMemberDto.userId,
    );
  }

  @Delete(':projectId/members/:userId')
  @ApiOperation({ summary: 'Remove a member from a project' })
  @ApiOkResponse({ description: 'Member removed' })
  @ApiConflictResponse({ description: 'Project owner cannot be removed' })
  @ApiForbiddenResponse({ description: 'Only the owner can remove members' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  removeMember(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projectsService.removeMember(projectId, currentUser.id, userId);
  }
}
