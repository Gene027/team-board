export enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.Low]: "Low",
  [TaskPriority.Medium]: "Medium",
  [TaskPriority.High]: "High",
};
