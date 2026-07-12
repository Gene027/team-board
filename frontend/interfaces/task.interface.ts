import type { TaskPriority } from "@/enums/task-priority.enum";
import type { TaskStatus } from "@/enums/task-status.enum";
import type { User } from "@/interfaces/auth.interface";

export interface TaskComment {
  id: string;
  body: string;
  authorId: string;
  author: User | null;
  createdAt: string;
}

export interface TaskListItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
  assignee: User | null;
}

export interface TaskDetail extends TaskListItem {
  comments: TaskComment[];
  assigner: User | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface AddTaskCommentPayload {
  body: string;
}
