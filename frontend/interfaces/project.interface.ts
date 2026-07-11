export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}
