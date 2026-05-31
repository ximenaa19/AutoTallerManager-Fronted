export interface CatalogItemDto {
  id: number;
  name: string;
}

export interface PublicRegistrationCatalogsDto {
  documentTypes: CatalogItemDto[];
  genders: CatalogItemDto[];
  countries: CatalogItemDto[];
  departments: CatalogItemDto[];
  cities: CatalogItemDto[];
  streetTypes: CatalogItemDto[];
  neighborhoods: CatalogItemDto[];
}
