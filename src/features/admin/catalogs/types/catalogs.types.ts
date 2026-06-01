/** Shared catalog record shape for generic table rendering. */
export type CatalogRecord = Record<string, unknown>;

export interface GenderDto {
  genderId: number;
  name: string;
}

export interface CreateGenderRequest {
  name?: string;
}

export interface UpdateGenderRequest {
  name?: string;
}

export interface StreetTypeDto {
  streetTypeId: number;
  name: string;
}

export interface CreateStreetTypeRequest {
  name?: string;
}

export interface UpdateStreetTypeRequest {
  name?: string;
}

export interface DocumentTypeDto {
  documentTypeId: number;
  code: string;
  name: string;
}

export interface EmailDomainDto {
  emailDomainId: number;
  domain: string;
}

export interface VehicleTypeDto {
  vehicleTypeId: number;
  name: string;
}

export interface CreateVehicleTypeRequest {
  name?: string;
}

export interface UpdateVehicleTypeRequest {
  name?: string;
}

export interface VehicleBrandDto {
  brandId: number;
  brandName: string;
}

export interface VehicleModelDto {
  modelId: number;
  brandId: number;
  modelName: string;
}

export interface ServiceTypeDto {
  serviceTypeId: number;
  name: string;
}

export interface CreateServiceTypeRequest {
  name?: string;
}

export interface UpdateServiceTypeRequest {
  name?: string;
}

export interface MechanicSpecialtyCatalogDto {
  specialtyId: number;
  name: string;
}

export interface CreateMechanicSpecialtyRequest {
  name?: string;
}

export interface UpdateMechanicSpecialtyRequest {
  name?: string;
}

export interface PartCategoryDto {
  partCategoryId: number;
  name: string;
}

export interface CreatePartCategoryRequest {
  name?: string;
}

export interface UpdatePartCategoryRequest {
  name?: string;
}

export interface PartBrandDto {
  partBrandId: number;
  name: string;
}

export interface CreatePartBrandRequest {
  name?: string;
}

export interface UpdatePartBrandRequest {
  name?: string;
}

export interface PaymentMethodDto {
  paymentMethodId: number;
  name: string;
}

export interface CreatePaymentMethodRequest {
  name?: string;
}

export interface UpdatePaymentMethodRequest {
  name?: string;
}

export interface PaymentStatusDto {
  paymentStatusId: number;
  name: string;
}

export interface CreatePaymentStatusRequest {
  name?: string;
}

export interface UpdatePaymentStatusRequest {
  name?: string;
}

export interface InvoiceStatusDto {
  invoiceStatusId: number;
  name: string;
}

export interface CreateInvoiceStatusRequest {
  name?: string;
}

export interface UpdateInvoiceStatusRequest {
  name?: string;
}

export interface OrderStatusDto {
  orderStatusId: number;
  name: string;
}

export interface CreateOrderStatusRequest {
  name?: string;
}

export interface UpdateOrderStatusRequest {
  name?: string;
}

export interface CardTypeDto {
  cardTypeId: number;
  name: string;
}

export interface CreateCardTypeRequest {
  name?: string;
}

export interface UpdateCardTypeRequest {
  name?: string;
}

export interface AuditActionTypeDto {
  auditActionTypeId: number;
  name: string;
}

export interface CreateAuditActionTypeRequest {
  name?: string;
}

export interface UpdateAuditActionTypeRequest {
  name?: string;
}

export interface CountryDto {
  countryId: number;
  name: string;
  phoneCode?: string;
}

export interface DepartmentDto {
  departmentId: number;
  countryId: number;
  name: string;
}

export interface CityDto {
  cityId: number;
  departmentId: number;
  name: string;
}

export interface NeighborhoodDto {
  neighborhoodId: number;
  cityId: number;
  name: string;
}
