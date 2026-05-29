export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  avatar_url: string;
  is_staff: true;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface AdminAuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  user: AdminUser;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface GoogleCallbackPayload {
  code: string;
  redirect_uri: string;
}

export interface RegularUser {
  id: number;
  email: string;
  username: string;
  avatar_url: string | null;
  is_staff: false;
}

export interface GoogleAuthPayload {
  code: string;
  redirect_uri: string;
}

export interface UserAuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  is_new_user: boolean;
  user: RegularUser;
}
