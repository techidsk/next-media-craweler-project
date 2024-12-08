export interface MediaItem {
  site: string;
  title: string;
  url: string;
  time: string;
}

export interface MediaResponse {
  items: MediaItem[];
  total: number;
  totalPages: number;
}

export interface MediaSearchParams {
  mediaId: string;
  page: number;
  title?: string;
  pageSize?: number;
  startTime?: Date | null;
  endTime?: Date | null;
} 