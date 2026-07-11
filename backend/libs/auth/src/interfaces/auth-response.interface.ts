import { UserProfile } from '@app/users';

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}
