export type UserRole = "admin" | "manager" | "user";

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_two_factor_enabled: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  // Returned when 2FA is required
  "2fa_required"?: boolean;
  user_id?: string;
  msg?: string;
}
