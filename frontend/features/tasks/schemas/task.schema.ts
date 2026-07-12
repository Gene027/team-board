import { z } from "zod";
import { TaskPriority } from "@/enums/task-priority.enum";
import { TaskStatus } from "@/enums/task-status.enum";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters.")
    .max(160, "Task title must be 160 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer.")
    .optional()
    .or(z.literal("")),
  status: z.enum(TaskStatus),
  priority: z.enum(TaskPriority),
  assigneeId: z.string().optional(),
});

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write a comment first.")
    .max(1000, "Comment must be 1000 characters or fewer."),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters.")
    .max(160, "Task title must be 160 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer.")
    .optional()
    .or(z.literal("")),
  assigneeId: z.string().optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
export type CommentFormValues = z.infer<typeof commentSchema>;
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;
