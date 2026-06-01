export interface MechanicSpecialtyDto {
  specialtyId: number;
  name: string;
}

export interface MechanicSpecialtySummaryDto {
  assignmentId: number;
  specialtyId: number;
  specialtyName: string;
}

export interface ReplaceMechanicSpecialtiesRequest {
  specialtyIds?: number[];
}
