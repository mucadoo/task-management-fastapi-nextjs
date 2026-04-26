export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
  name?: string;
}

export interface UpdateMeData {
  email?: string;
  name?: string;
  username?: string;
  password?: string;
  current_password?: string;
}
