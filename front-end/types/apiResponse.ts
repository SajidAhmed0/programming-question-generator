export interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  error: {
    title: string;
    detail: string;
  };
}

export type ErrorInfo = {
  message: string;
  code?: string | null;
};
