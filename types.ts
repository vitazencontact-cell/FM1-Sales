export interface ColisItem {
  code: string;
  etat: string;
  client?: string;
  tel?: string;
  adresse?: string;
  montant?: number | string;
  poids?: number | string;
  extra?: Record<string, unknown>;
}

export interface ApiResponse {
  page: number;
  pageSize: number;
  items: ColisItem[];
}
