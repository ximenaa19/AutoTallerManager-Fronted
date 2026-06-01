export interface PersonRoleDto {
  personRoleId: number;
  personId: number;
  roleId: number;
  isActive: boolean;
}

export interface CreatePersonRoleRequest {
  personId: number;
  roleId: number;
  isActive: boolean;
}

export interface UpdatePersonRoleRequest {
  personId: number;
  roleId: number;
  isActive: boolean;
}
