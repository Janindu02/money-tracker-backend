export declare class PaginationDto {
    page?: number;
    limit?: number;
    search?: string;
}
export declare function paginateMeta(total: number, page: number, limit: number): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};
