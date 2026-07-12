export const ROUTES = {
  dashboard: "/projects",
  login: "/",
  project: (projectId: string) => `/projects/${projectId}`,
};
