export interface UserDto {
  userId: number;
  personId: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  personId: number;
  password?: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  personId: number;
  newPassword?: string;
  isActive: boolean;
}
