/** Types aligned with Application/Features/AdminMechanics/Dtos. */

export interface AdminMechanicSpecialtyDto {
  specialtyId: number;
  specialtyName: string;
}

export interface AdminMechanicListItemDto {
  personId: number;
  fullName: string;
  documentNumber: string;
  userId?: number | null;
  email?: string | null;
  isUserActive?: boolean | null;
  roleActive: boolean;
  specialties: AdminMechanicSpecialtyDto[];
  assignedServicesCount: number;
  activeOrdersCount: number;
}

export interface AdminMechanicRoleDto {
  roleId: number;
  roleName: string;
  isActive: boolean;
}

export interface AdminMechanicUserDto {
  userId: number;
  email: string;
  isActive: boolean;
}

export interface AdminMechanicWorkloadServiceDto {
  mechanicAssignmentId: number;
  orderServiceId: number;
  serviceOrderId: number;
  serviceTypeName?: string | null;
  vehiclePlate?: string | null;
  orderStatusName?: string | null;
  customerName?: string | null;
  customerApproved: boolean;
  approvalDate?: string | null;
  workReported: boolean;
}

export interface AdminMechanicActiveOrderDto {
  serviceOrderId: number;
  vehicleId: number;
  vehiclePlate?: string | null;
  orderStatusName: string;
  entryDate: string;
  estimatedDeliveryDate?: string | null;
  assignedServicesCount: number;
  pendingWorkReportsCount: number;
}

export interface AdminMechanicDetailDto {
  personId: number;
  fullName: string;
  documentNumber: string;
  documentTypeName?: string | null;
  userId?: number | null;
  email?: string | null;
  phoneNumber?: string | null;
  isUserActive?: boolean | null;
  roleActive: boolean;
  createdAt: string;
  specialties: AdminMechanicSpecialtyDto[];
  roles: AdminMechanicRoleDto[];
  user?: AdminMechanicUserDto | null;
  assignedServicesCount: number;
  activeOrdersCount: number;
  assignedServices: AdminMechanicWorkloadServiceDto[];
  activeOrders: AdminMechanicActiveOrderDto[];
}

export interface AdminMechanicWorkloadDto {
  personId: number;
  fullName: string;
  assignedServicesCount: number;
  activeOrdersCount: number;
  pendingServicesCount: number;
  inProgressServicesCount: number;
  completedServicesCount: number;
  services: AdminMechanicWorkloadServiceDto[];
}
