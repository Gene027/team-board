import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

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
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop({ type: [String], required: true, index: true })
  memberIds: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
