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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticatedUser, CurrentUser, JwtAuthGuard } from '@app/common';
import { AddTaskCommentDto } from './dto/add-task-comment.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth('JWT')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task in a project' })
  @ApiCreatedResponse({ description: 'Task created' })
  @ApiForbiddenResponse({ description: 'Current user is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(projectId, currentUser.id, createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks in a project' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search tasks by title.',
    example: 'dashboard',
  })
  @ApiQuery({
    name: 'assigneeId',
    required: false,
    description: 'Filter tasks by assignee id.',
    example: '66b3fcb8f152aa994acba123',
  })
  @ApiOkResponse({ description: 'Tasks returned' })
  @ApiForbiddenResponse({ description: 'Current user is not a project member' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findAll(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Query() query: ListTasksQueryDto,
  ) {
    return this.tasksService.findAllForProject(projectId, currentUser.id, query);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get a task in a project' })
  @ApiOkResponse({ description: 'Task returned' })
  @ApiForbiddenResponse({ description: 'Current user is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  findOne(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.findOne(projectId, taskId, currentUser.id);
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Update a task in a project' })
  @ApiOkResponse({ description: 'Task updated' })
  @ApiForbiddenResponse({ description: 'Current user is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(projectId, taskId, currentUser.id, updateTaskDto);
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete a task in a project' })
  @ApiOkResponse({ description: 'Task deleted' })
  @ApiForbiddenResponse({ description: 'Current user is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.remove(projectId, taskId, currentUser.id);
  }

  @Post(':taskId/comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiCreatedResponse({ description: 'Comment added' })
  @ApiForbiddenResponse({ description: 'Current user is not a project member' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  addComment(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() addTaskCommentDto: AddTaskCommentDto,
  ) {
    return this.tasksService.addComment(
      projectId,
      taskId,
      currentUser.id,
      addTaskCommentDto,
    );
  }
}
