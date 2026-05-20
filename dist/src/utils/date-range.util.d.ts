export interface DateRangeQuery {
    year?: number;
    month?: number;
    day?: number;
    startDate?: string;
    endDate?: string;
}
export declare function buildDateRange(query: DateRangeQuery): {
    gte: Date;
    lte: Date;
} | undefined;
export declare function currentMonthRange(): {
    gte: Date;
    lte: Date;
};
