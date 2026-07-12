export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectDetail extends ProjectListItem {
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface AddProjectMemberPayload {
  userId: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}
