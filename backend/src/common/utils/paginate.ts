import { FindManyOptions, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto.js';
import { PaginatedResult } from '../interface/paginated-result.interface.js';

/**
 * Global pagination helper for TypeORM Repository or SelectQueryBuilder.
 *
 * Usage with Repository:
 * const result = await paginate(this.userRepository, paginationDto, { where: { tenantId } });
 *
 * Usage with QueryBuilder:
 * const qb = this.userRepository.createQueryBuilder('user').where('user.tenantId = :tenantId', { tenantId });
 * const result = await paginate(qb, paginationDto);
 */
export async function paginate<T extends ObjectLiteral>(
  target: Repository<T> | SelectQueryBuilder<T>,
  paginationDto?: PaginationQueryDto,
  options?: FindManyOptions<T>,
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(paginationDto?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(paginationDto?.limit) || 10));
  const skip = (page - 1) * limit;

  let items: T[];
  let totalItems: number;

  if (target instanceof Repository) {
    const [data, count] = await target.findAndCount({
      ...options,
      skip,
      take: limit,
    });
    items = data;
    totalItems = count;
  } else {
    const [data, count] = await target
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    items = data;
    totalItems = count;
  }

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPages: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
