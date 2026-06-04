import { httpClient } from '@/api/httpClient';
import type { PartSearchResultDto } from '@/features/mechanic/types/mechanicParts.types';

export const mechanicPartsApi = {
  searchParts(term: string) {
    return httpClient.get<PartSearchResultDto[]>('/api/search/parts', {
      params: { term },
    });
  },
};
