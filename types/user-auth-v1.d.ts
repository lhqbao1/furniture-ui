export type UserAuthV1TokenType = "bearer" | string;

export type UserAuthV1User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  warehouse_id: string;
  partner_id: string;
};

export type UserAuthV1LoginRequest = {
  email: string;
  password: string;
};

export type UserAuthV1TokenResponse = {
  access_token: string;
  token_type: UserAuthV1TokenType;
  user: UserAuthV1User;
  permissions: string[];
};

export type UserAuthV1BootstrapAdminRequest = {
  email: string;
  full_name: string;
  role: string;
  warehouse_id: string;
  partner_id: string;
  is_active: boolean;
  password: string;
};

export type UserAuthV1UserReadResponse = UserAuthV1User & {
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};
