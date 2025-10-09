
export interface ValidationError {
    field?: string;
    message: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: ValidationError[];
    timestamp?: string;
}

