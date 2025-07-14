// 這個檔案現在只定義 Pagefind Core API 需要的類型

export interface PagefindSearchOptions {
  filters?: Record<string, string[]>;
  sort?: Record<string, 'asc' | 'desc'>;
}

// result.data() 返回的物件
export interface PagefindDocument {
  url: string;
  content: string;
  word_count: number;
  filters: Record<string, string[]>;
  // 【關鍵】meta 資料在這裡
  meta: {
    clubCode?: string;
    title?: string;
    [key: string]: string | undefined;
  };
  excerpt: string;
  sub_results: sub_result[];
  // ... 其他你可能需要的欄位
}
export interface sub_result {
  title: string;
  url: string;
  excerpt: string;
}

// results 陣列中的單個結果
export interface PagefindResult {
  id: string;
  score: number;
  words: number[];
  data: () => Promise<PagefindDocument>;
}

// `pagefind.search()` 返回的頂層物件
export interface PagefindSearchResults {
  results: PagefindResult[];
  unfilteredResultCount: number;
  filters: Record<string, Record<string, number>>;
  totalFilters: Record<string, Record<string, number>>;
  timings: {
    preload: number;
    search: number;
    total: number;
  };
}

export type PagefindFilterCounts = Record<string, number>;

// Pagefind 核心 API 的介面
export interface PagefindAPI {
  search(term: string | null, options?: PagefindSearchOptions): Promise<PagefindSearchResults>;
  options(options: any): Promise<void>;
  filters(): Promise<Record<string, PagefindFilterCounts>>;

}