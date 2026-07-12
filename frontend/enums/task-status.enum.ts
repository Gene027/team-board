export enum TaskStatus {
  Todo = "todo",
  InProgress = "in_progress",
  Blocked = "blocked",
  Done = "done",
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: "To do",
  [TaskStatus.InProgress]: "In progress",
  [TaskStatus.Blocked]: "Blocked",
  [TaskStatus.Done]: "Done",
};
