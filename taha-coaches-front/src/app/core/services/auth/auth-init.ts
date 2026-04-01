import { AuthService } from './auth.service';

export function initAuth(auth: AuthService) {
  // This function will be called before the app loads
  return () => auth.getCurrentUser(); // returns a Promise<User | null>
}
