export interface RegisterAccountPayload {
  name: string;
  region: string;
  contentLanguage: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  language: string;
  account: RegisterAccountPayload;
}

export interface RegisterUser {
  id: string;
  email: string;
  name: string;
}

export interface RegisterResponse {
  accessToken: string;
  user: RegisterUser;
}

export type LoginResponse = RegisterResponse;
