import type { CatalogRecord } from '@/features/admin/catalogs/types/catalogs.types';

export type CatalogGroupId =
  | 'identity'
  | 'vehicles'
  | 'workshop'
  | 'inventory'
  | 'billing'
  | 'geography'
  | 'system';

export type CatalogFieldType = 'text' | 'select';

export interface CatalogFieldDefinition {
  key: string;
  label: string;
  type: CatalogFieldType;
  required?: boolean;
  maxLength?: number;
  showInTable?: boolean;
  formOnly?: boolean;
  /** Parent catalog key for FK select fields. */
  selectCatalogKey?: string;
  selectLabelField?: string;
  selectValueField?: string;
}

export interface CatalogOperations {
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface CatalogDefinition {
  key: string;
  title: string;
  description: string;
  group: CatalogGroupId;
  apiPath: string;
  idField: string;
  operations: CatalogOperations;
  fields: CatalogFieldDefinition[];
  /** Shown when create/update/delete are disabled. */
  readOnlyReason?: string;
}

export interface CatalogGroupDefinition {
  id: CatalogGroupId;
  title: string;
  description: string;
}

export const CATALOG_GROUPS: CatalogGroupDefinition[] = [
  {
    id: 'identity',
    title: 'Identity & People',
    description: 'Person identity, contact, and address reference data.',
  },
  {
    id: 'vehicles',
    title: 'Vehicles',
    description: 'Vehicle classification used in intake and fleet records.',
  },
  {
    id: 'workshop',
    title: 'Workshop & Services',
    description: 'Service types, specialties, and order workflow statuses.',
  },
  {
    id: 'inventory',
    title: 'Inventory & Parts',
    description: 'Part taxonomy for stock and purchasing.',
  },
  {
    id: 'billing',
    title: 'Billing & Payments',
    description: 'Invoice, payment, and card reference values.',
  },
  {
    id: 'geography',
    title: 'Geography',
    description: 'Country → department → city → neighborhood hierarchy.',
  },
  {
    id: 'system',
    title: 'System & Audit',
    description: 'Audit action types and system lookup values.',
  },
];

const nameField = (maxLength = 100): CatalogFieldDefinition => ({
  key: 'name',
  label: 'Name',
  type: 'text',
  required: true,
  maxLength,
  showInTable: true,
});

export const CATALOG_DEFINITIONS: CatalogDefinition[] = [
  {
    key: 'document-types',
    title: 'Document Types',
    description: 'Identification document codes used for persons and registration.',
    group: 'identity',
    apiPath: '/api/document-types',
    idField: 'documentTypeId',
    operations: { create: false, update: false, delete: false },
    readOnlyReason:
      'Create/update request fields for document types are not documented in api-contract.md §10.',
    fields: [
      {
        key: 'documentTypeId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      { key: 'code', label: 'Code', type: 'text', showInTable: true },
      nameField(80),
    ],
  },
  {
    key: 'genders',
    title: 'Genders',
    description: 'Gender values referenced by person profiles.',
    group: 'identity',
    apiPath: '/api/genders',
    idField: 'genderId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'genderId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(50),
    ],
  },
  {
    key: 'street-types',
    title: 'Street Types',
    description: 'Street type labels used when composing addresses.',
    group: 'identity',
    apiPath: '/api/street-types',
    idField: 'streetTypeId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'streetTypeId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(50),
    ],
  },
  {
    key: 'email-domains',
    title: 'Email Domains',
    description: 'Normalized email domains for person email records.',
    group: 'identity',
    apiPath: '/api/email-domains',
    idField: 'emailDomainId',
    operations: { create: false, update: false, delete: false },
    readOnlyReason:
      'Create/update request fields for email domains are not documented in api-contract.md §10.',
    fields: [
      {
        key: 'emailDomainId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      {
        key: 'domain',
        label: 'Domain',
        type: 'text',
        required: true,
        maxLength: 100,
        showInTable: true,
      },
    ],
  },
  {
    key: 'vehicle-types',
    title: 'Vehicle Types',
    description: 'Vehicle body/type classification (car, SUV, motorcycle, etc.).',
    group: 'vehicles',
    apiPath: '/api/vehicle-types',
    idField: 'vehicleTypeId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'vehicleTypeId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(80),
    ],
  },
  {
    key: 'vehicle-brands',
    title: 'Vehicle Brands',
    description: 'Manufacturer brands linked to vehicle models.',
    group: 'vehicles',
    apiPath: '/api/vehicle-brands',
    idField: 'brandId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'brandId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      {
        key: 'brandName',
        label: 'Brand name',
        type: 'text',
        required: true,
        maxLength: 80,
        showInTable: true,
      },
    ],
  },
  {
    key: 'vehicle-models',
    title: 'Vehicle Models',
    description: 'Models belonging to a vehicle brand.',
    group: 'vehicles',
    apiPath: '/api/vehicle-models',
    idField: 'modelId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'modelId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      {
        key: 'brandId',
        label: 'Brand',
        type: 'select',
        required: true,
        showInTable: true,
        selectCatalogKey: 'vehicle-brands',
        selectLabelField: 'brandName',
        selectValueField: 'brandId',
      },
      {
        key: 'modelName',
        label: 'Model name',
        type: 'text',
        required: true,
        maxLength: 80,
        showInTable: true,
      },
    ],
  },
  {
    key: 'service-types',
    title: 'Service Types',
    description: 'Workshop service catalog for orders and labor lines.',
    group: 'workshop',
    apiPath: '/api/service-types',
    idField: 'serviceTypeId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'serviceTypeId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(100),
    ],
  },
  {
    key: 'mechanic-specialties',
    title: 'Mechanic Specialties',
    description: 'Specialties assigned to mechanics during staff registration.',
    group: 'workshop',
    apiPath: '/api/mechanic-specialties',
    idField: 'specialtyId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'specialtyId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(100),
    ],
  },
  {
    key: 'order-statuses',
    title: 'Order Statuses',
    description: 'Service order workflow statuses (pending, in progress, etc.).',
    group: 'workshop',
    apiPath: '/api/order-statuses',
    idField: 'orderStatusId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'orderStatusId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(50),
    ],
  },
  {
    key: 'part-categories',
    title: 'Part Categories',
    description: 'Inventory part grouping for stock and search.',
    group: 'inventory',
    apiPath: '/api/part-categories',
    idField: 'partCategoryId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'partCategoryId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(100),
    ],
  },
  {
    key: 'part-brands',
    title: 'Part Brands',
    description: 'Manufacturer brands for spare parts.',
    group: 'inventory',
    apiPath: '/api/part-brands',
    idField: 'partBrandId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'partBrandId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(100),
    ],
  },
  {
    key: 'payment-methods',
    title: 'Payment Methods',
    description: 'Accepted payment methods (cash, card, transfer).',
    group: 'billing',
    apiPath: '/api/payment-methods',
    idField: 'paymentMethodId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'paymentMethodId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(50),
    ],
  },
  {
    key: 'payment-statuses',
    title: 'Payment Statuses',
    description: 'Payment lifecycle statuses for billing records.',
    group: 'billing',
    apiPath: '/api/payment-statuses',
    idField: 'paymentStatusId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'paymentStatusId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(50),
    ],
  },
  {
    key: 'invoice-statuses',
    title: 'Invoice Statuses',
    description: 'Invoice workflow statuses (draft, issued, paid, etc.).',
    group: 'billing',
    apiPath: '/api/invoice-statuses',
    idField: 'invoiceStatusId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'invoiceStatusId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(50),
    ],
  },
  {
    key: 'card-types',
    title: 'Card Types',
    description: 'Card networks/types used when recording card payments.',
    group: 'billing',
    apiPath: '/api/card-types',
    idField: 'cardTypeId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'cardTypeId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(50),
    ],
  },
  {
    key: 'countries',
    title: 'Countries',
    description: 'Countries for addresses and phone country codes.',
    group: 'geography',
    apiPath: '/api/countries',
    idField: 'countryId',
    operations: { create: false, update: false, delete: false },
    readOnlyReason:
      'Create/update request fields for countries are not documented in api-contract.md §10.',
    fields: [
      {
        key: 'countryId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(100),
      {
        key: 'phoneCode',
        label: 'Phone code',
        type: 'text',
        maxLength: 10,
        showInTable: true,
      },
    ],
  },
  {
    key: 'departments',
    title: 'Departments',
    description: 'State/province regions within a country.',
    group: 'geography',
    apiPath: '/api/departments',
    idField: 'departmentId',
    operations: { create: false, update: false, delete: false },
    readOnlyReason:
      'Create/update request fields for departments are not documented in api-contract.md §10.',
    fields: [
      {
        key: 'departmentId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      {
        key: 'countryId',
        label: 'Country ID',
        type: 'text',
        showInTable: true,
      },
      nameField(100),
    ],
  },
  {
    key: 'cities',
    title: 'Cities',
    description: 'Cities within a department.',
    group: 'geography',
    apiPath: '/api/cities',
    idField: 'cityId',
    operations: { create: false, update: false, delete: false },
    readOnlyReason:
      'Create/update request fields for cities are not documented in api-contract.md §10.',
    fields: [
      {
        key: 'cityId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      {
        key: 'departmentId',
        label: 'Department ID',
        type: 'text',
        showInTable: true,
      },
      nameField(100),
    ],
  },
  {
    key: 'neighborhoods',
    title: 'Neighborhoods',
    description: 'Neighborhoods or districts within a city.',
    group: 'geography',
    apiPath: '/api/neighborhoods',
    idField: 'neighborhoodId',
    operations: { create: false, update: false, delete: false },
    readOnlyReason:
      'Create/update request fields for neighborhoods are not documented in api-contract.md §10.',
    fields: [
      {
        key: 'neighborhoodId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      {
        key: 'cityId',
        label: 'City ID',
        type: 'text',
        showInTable: true,
      },
      nameField(100),
    ],
  },
  {
    key: 'audit-action-types',
    title: 'Audit Action Types',
    description: 'Action labels recorded in the audit trail.',
    group: 'system',
    apiPath: '/api/audit-action-types',
    idField: 'auditActionTypeId',
    operations: { create: true, update: true, delete: true },
    fields: [
      {
        key: 'auditActionTypeId',
        label: 'ID',
        type: 'text',
        showInTable: true,
        formOnly: true,
      },
      nameField(100),
    ],
  },
];

const catalogMap = new Map(CATALOG_DEFINITIONS.map((definition) => [definition.key, definition]));

export function getCatalogDefinition(key: string): CatalogDefinition | undefined {
  return catalogMap.get(key);
}

export function getAllCatalogDefinitions(): CatalogDefinition[] {
  return CATALOG_DEFINITIONS;
}

export function getCatalogGroupDefinition(
  groupId: CatalogGroupId,
): CatalogGroupDefinition | undefined {
  return CATALOG_GROUPS.find((group) => group.id === groupId);
}

export function getCatalogDefinitionsByGroup(groupId: CatalogGroupId): CatalogDefinition[] {
  return CATALOG_DEFINITIONS.filter((definition) => definition.group === groupId);
}

export function getCatalogRecordId(
  record: CatalogRecord,
  definition: CatalogDefinition,
): number {
  const value = record[definition.idField];
  return typeof value === 'number' ? value : Number(value);
}

export function getCatalogRecordLabel(
  record: CatalogRecord,
  definition: CatalogDefinition,
): string {
  const nameValue = record.name ?? record.brandName ?? record.modelName ?? record.domain;
  if (typeof nameValue === 'string' && nameValue.trim()) {
    return nameValue;
  }

  const codeValue = record.code;
  if (typeof codeValue === 'string' && codeValue.trim()) {
    return codeValue;
  }

  return `#${getCatalogRecordId(record, definition)}`;
}

export function catalogRecordMatchesSearch(
  record: CatalogRecord,
  definition: CatalogDefinition,
  term: string,
): boolean {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return true;

  const values = definition.fields
    .map((field) => record[field.key])
    .filter((value) => value !== null && value !== undefined);

  return values.some((value) => String(value).toLowerCase().includes(normalizedTerm));
}

export function isCatalogWritable(definition: CatalogDefinition): boolean {
  return (
    definition.operations.create ||
    definition.operations.update ||
    definition.operations.delete
  );
}
