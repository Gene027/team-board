import { UserProfile } from '@app/users';

export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectDetail extends ProjectListItem {
  members: UserProfile[];
}
