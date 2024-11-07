import { sql } from 'drizzle-orm';

export interface PaginationMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Paginates a query using deferred join for better performance.
 *
 * @param database the database to query
 * @param queryBuilder the query builder to paginate
 * @param page the page number to retrieve (default: 1)
 * @param pageSize the number of items per page (default: 10)
 * @returns a PaginatedResult containing the items and pagination metadata
 */
export async function paginate<T>(
  database: any,
  queryBuilder: any,
  page: number,
  pageSize: number,
): Promise<PaginatedResult<T>> {
  // Get total count
  const [{ count }] = await database
    .select({ count: sql`count(*)` })
    .from(queryBuilder.as('countSq'));

  const totalItems = Number(count);

  // Get paginated items with specific fields
  const items = await queryBuilder
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Calculate pagination metadata
  const itemCount = items.length;
  const itemsPerPage = Number(pageSize);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = Number(page);

  return {
    items,
    meta: {
      itemCount,
      totalItems,
      itemsPerPage,
      totalPages,
      currentPage,
    },
  };
}
