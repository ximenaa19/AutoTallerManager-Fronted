export interface RoleDto {
  roleId: number;
  roleName: string;
}

export interface CreateRoleRequest {
  roleName?: string;
}

export interface UpdateRoleRequest {
  roleName?: string;
}
