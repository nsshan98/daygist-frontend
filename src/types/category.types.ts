// ===============================|| CATEGORY TYPES ||============================== //

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: 0 | 1 | 2;
  iconUrl: string;
  sortOrder: number;
  children: Category[];
}

export interface CategoryTreeResponse {
  success: boolean;
  data: Category[];
}
