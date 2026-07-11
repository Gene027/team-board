import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TaskPriority, TaskStatus } from '@app/common';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ _id: true, id: true })
export class TaskComment {
  @Prop({ type: String, required: true, trim: true })
  body: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: Date, required: true, default: Date.now })
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
      ret.projectId = ret.projectId?.toString();
      ret.assigneeId = ret.assigneeId?.toString() ?? null;
      ret.createdById = ret.createdById?.toString();
      ret.comments = Array.isArray(ret.comments)
        ? ret.comments.map((comment: Record<string, unknown>) => ({
            ...comment,
            id: comment._id?.toString(),
            authorId: comment.authorId?.toString(),
            _id: undefined,
          }))
        : ret.comments;
      delete ret._id;
      return ret;
    },
  },
})
export class Task {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, trim: true, default: '' })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.Todo,
    required: true,
  })
  status: TaskStatus;

  @Prop({
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.Medium,
    required: true,
  })
  priority: TaskPriority;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assigneeId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById: Types.ObjectId;

  @Prop({ type: [TaskCommentSchema], default: [] })
  comments: TaskComment[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
