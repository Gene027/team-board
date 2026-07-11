import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id?.toString();
      ret.ownerId = ret.ownerId?.toString();
      ret.memberIds = Array.isArray(ret.memberIds)
        ? (ret.memberIds as unknown[]).map((memberId) => String(memberId))
        : ret.memberIds;
      delete ret._id;
      return ret;
    },
  },
})
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true, index: true })
  memberIds: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
