import { describe, it, expect, vi } from 'vitest';
import { paginate } from './paginate.js';
import { Repository, SelectQueryBuilder } from 'typeorm';

describe('paginate utility', () => {
  it('should paginate repository query with default page and limit', async () => {
    const mockRepo = Object.create(Repository.prototype);
    mockRepo.findAndCount = vi.fn().mockResolvedValue([
      [{ id: '1' }, { id: '2' }],
      25,
    ]);

    const result = await paginate(mockRepo as Repository<any>);

    expect(mockRepo.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      data: [{ id: '1' }, { id: '2' }],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPages: true,
        hasPrevPage: false,
      },
    });
  });

  it('should calculate correct skip and take for custom page and limit', async () => {
    const mockRepo = Object.create(Repository.prototype);
    mockRepo.findAndCount = vi.fn().mockResolvedValue([
      [{ id: '11' }, { id: '12' }],
      30,
    ]);

    const result = await paginate(mockRepo as Repository<any>, {
      page: 2,
      limit: 10,
    });

    expect(mockRepo.findAndCount).toHaveBeenCalledWith({
      skip: 10,
      take: 10,
    });
    expect(result.meta.page).toBe(2);
    expect(result.meta.hasPrevPage).toBe(true);
    expect(result.meta.hasNextPages).toBe(true);
  });

  it('should cap limit at 100', async () => {
    const mockRepo = Object.create(Repository.prototype);
    mockRepo.findAndCount = vi.fn().mockResolvedValue([[], 0]);

    await paginate(mockRepo as Repository<any>, {
      page: 1,
      limit: 500,
    });

    expect(mockRepo.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 100,
    });
  });

  it('should paginate using SelectQueryBuilder correctly', async () => {
    const mockQb = Object.create(SelectQueryBuilder.prototype);
    mockQb.skip = vi.fn().mockReturnThis();
    mockQb.take = vi.fn().mockReturnThis();
    mockQb.getManyAndCount = vi.fn().mockResolvedValue([[{ id: 'item-1' }], 1]);

    const result = await paginate(mockQb as SelectQueryBuilder<any>, {
      page: 1,
      limit: 10,
    });

    expect(mockQb.skip).toHaveBeenCalledWith(0);
    expect(mockQb.take).toHaveBeenCalledWith(10);
    expect(mockQb.getManyAndCount).toHaveBeenCalled();
    expect(result.data).toEqual([{ id: 'item-1' }]);
    expect(result.meta.totalPages).toBe(1);
    expect(result.meta.hasNextPages).toBe(false);
  });
});
