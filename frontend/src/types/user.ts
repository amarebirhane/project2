export type UserRole = "admin" | "manager" | "user";

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}


export interface AuthResponse {
  access_token: string;
  token_type: string;
}
