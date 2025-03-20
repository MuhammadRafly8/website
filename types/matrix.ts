export interface MatrixItem {
  id: string;
  title: string;
  description: string;
  keyword: string;
  createdAt: string;
  createdBy: string;
  data: StructuredMatrix;
  sharedWith: string[];
}

export interface StructuredMatrix {
  rows: { id: number; name: string; category: string }[];
  columns: { id: number; name: string }[];
  dependencies: Record<string, boolean>;
}