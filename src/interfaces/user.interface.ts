export interface UpdateUser {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  login_provider?: string;
  providers?: string[];
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}
