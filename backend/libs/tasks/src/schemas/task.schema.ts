import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TaskPriority, TaskStatus } from '@app/common';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ _id: true, id: true })
export class TaskComment {
  @Prop({ required: true, trim: true })
  body: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

const TaskCommentSchema = SchemaFactory.createForClass(TaskComment);

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      return ret;
    },
  },
})
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({
    enum: Object.values(TaskStatus),
    default: TaskStatus.Todo,
    required: true,
  })
  status: TaskStatus;

  @Prop({
    enum: Object.values(TaskPriority),
    default: TaskPriority.Medium,
    required: true,
  })
  priority: TaskPriority;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ type: String, default: null })
  assigneeId?: string | null;

  @Prop({ required: true })
  createdById: string;

  @Prop({ type: [TaskCommentSchema], default: [] })
  comments: TaskComment[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
