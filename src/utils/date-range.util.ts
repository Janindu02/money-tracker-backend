export interface DateRangeQuery {
  year?: number;
  month?: number;
  day?: number;
  startDate?: string;
  endDate?: string;
}

/** Build Prisma date range from year/month/day or explicit start/end */
export function buildDateRange(query: DateRangeQuery): { gte: Date; lte: Date } | undefined {
  if (query.startDate || query.endDate) {
    const gte = query.startDate ? new Date(query.startDate) : new Date(0);
    const lte = query.endDate ? new Date(query.endDate) : new Date();
    return { gte, lte };
  }

  if (query.year && query.month && query.day) {
    return {
      gte: new Date(query.year, query.month - 1, query.day, 0, 0, 0, 0),
      lte: new Date(query.year, query.month - 1, query.day, 23, 59, 59, 999),
    };
  }

  if (query.year && query.month) {
    return {
      gte: new Date(query.year, query.month - 1, 1),
      lte: new Date(query.year, query.month, 0, 23, 59, 59, 999),
    };
  }

  if (query.year) {
    return {
      gte: new Date(query.year, 0, 1),
      lte: new Date(query.year, 11, 31, 23, 59, 59, 999),
    };
  }

  return undefined;
}

/** Default: current calendar month */
export function currentMonthRange(): { gte: Date; lte: Date } {
  const now = new Date();
  return {
    gte: new Date(now.getFullYear(), now.getMonth(), 1),
    lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}
