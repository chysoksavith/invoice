---
name: backend-crud
description: >-
  Use this skill whenever asked to create, scaffold, extend, or refactor a backend CRUD module or REST feature in NestJS.
  Enforces multi-tenancy, ESM syntax (.js imports), folder structure, and the util-first reusability rule.
---

# NestJS Backend CRUD Scaffold & Discipline Runbook

This runbook guides the agent through building production-ready, multi-tenant CRUD modules in this NestJS codebase.

---

## 1. Pre-Flight Checklist

Before writing any code, answer these three questions:

1. **Is the resource tenant-scoped or global?**
   - Tenant-scoped (90% of resources: products, invoices, tracking, contacts, etc.): Must extend `TenantBaseEntity` and filter by `tenantId`.
   - Global (tenants themselves, system currencies, system audit): Independent entity.
2. **Does reusable logic belong in `common/utils/`?**
   - Check if the entity or operations require slugification, money math, NBC exchange calculations, date range parsing, or custom validation.
   - **If YES**: Implement the utility in `backend/src/common/utils/` **before** writing the module code.
3. **Are you using `.js` extensions on all local imports?**
   - This project uses native ESM (`"type": "module"`). All relative imports must end with `.js`.

---

## 2. Directory Blueprint

For a resource named `<resource>` (e.g., `products`, `invoices`, `categories`), create:

```text
backend/src/modules/<resource>/
├── dto/
│   ├── create-<resource>.dto.ts
│   ├── update-<resource>.dto.ts
│   └── query-<resource>.dto.ts
├── entities/
│   └── <resource>.entity.ts
├── <resource>.controller.ts
├── <resource>.service.ts
├── <resource>.module.ts
└── <resource>.service.spec.ts
```

---

## 3. Step-by-Step Implementation

### Step 3.1: Entity (`entities/<resource>.entity.ts`)

```typescript
import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity.js';

@Entity('<table_name>')
export class <ResourceName> extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
```

### Step 3.2: DTOs (`dto/`)

1. **`dto/create-<resource>.dto.ts`**:
   ```typescript
   import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

   export class Create<ResourceName>Dto {
     @IsString()
     @IsNotEmpty()
     @MaxLength(255)
     name: string;
   }
   ```

2. **`dto/update-<resource>.dto.ts`**:
   ```typescript
   import { PartialType } from '@nestjs/mapped-types';
   import { IsBoolean, IsOptional } from 'class-validator';
   import { Create<ResourceName>Dto } from './create-<resource>.dto.js';

   export class Update<ResourceName>Dto extends PartialType(Create<ResourceNameDto>) {
     @IsOptional()
     @IsBoolean()
     isActive?: boolean;
   }
   ```

3. **`dto/query-<resource>.dto.ts`**:
   ```typescript
   import { IsOptional, IsString } from 'class-validator';
   import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

   export class Query<ResourceName>Dto extends PaginationQueryDto {
     @IsOptional()
     @IsString()
     search?: string;
   }
   ```

### Step 3.3: Service (`<resource>.service.ts`)

Always use the global `paginate(...)` utility for list queries. Always scope by `tenantId`.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { <ResourceName> } from './entities/<resource>.entity.js';
import { Create<ResourceName>Dto } from './dto/create-<resource>.dto.js';
import { Update<ResourceName>Dto } from './dto/update-<resource>.dto.js';
import { Query<ResourceName>Dto } from './dto/query-<resource>.dto.js';
import { PaginatedResult } from '../../common/interface/paginated-result.interface.js';
import { paginate } from '../../common/utils/paginate.js';

@Injectable()
export class <ResourceName>Service {
  constructor(
    @InjectRepository(<ResourceName>)
    private readonly repository: Repository<<ResourceName>>,
  ) {}

  async create(tenantId: string, dto: Create<ResourceName>Dto): Promise<<ResourceName>> {
    const record = this.repository.create({ ...dto, tenantId });
    return this.repository.save(record);
  }

  async findAll(tenantId: string, queryDto?: Query<ResourceName>Dto): Promise<PaginatedResult<<ResourceName>>> {
    const where: FindOptionsWhere<<ResourceName>> = { tenantId };

    if (queryDto?.search) {
      where.name = ILike(`%${queryDto.search}%`);
    }

    return paginate(this.repository, queryDto, {
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(tenantId: string, id: string): Promise<<ResourceName>> {
    const record = await this.repository.findOne({
      where: { id, tenantId },
    });

    if (!record) {
      throw new NotFoundException(`<ResourceName> #${id} not found`);
    }

    return record;
  }

  async update(tenantId: string, id: string, dto: Update<ResourceName>Dto): Promise<<ResourceName>> {
    const record = await this.findById(tenantId, id);
    Object.assign(record, dto);
    return this.repository.save(record);
  }

  async remove(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    const record = await this.findById(tenantId, id);
    await this.repository.remove(record);
    return { success: true, message: `<ResourceName> #${id} deleted` };
  }
}
```

### Step 3.4: Controller (`<resource>.controller.ts`)

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { <ResourceName>Service } from './<resource>.service.js';
import { Create<ResourceName>Dto } from './dto/create-<resource>.dto.js';
import { Update<ResourceName>Dto } from './dto/update-<resource>.dto.js';
import { Query<ResourceName>Dto } from './dto/query-<resource>.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator.js';

@Controller('<resource>')
@UseGuards(JwtAuthGuard, TenantGuard)
export class <ResourceName>Controller {
  constructor(private readonly service: <ResourceName>Service) {}

  @Post()
  create(
    @CurrentTenantId() tenantId: string,
    @Body() dto: Create<ResourceName>Dto,
  ) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenantId() tenantId: string,
    @Query() queryDto: Query<ResourceName>Dto,
  ) {
    return this.service.findAll(tenantId, queryDto);
  }

  @Get(':id')
  findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Update<ResourceName>Dto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentTenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(tenantId, id);
  }
}
```

### Step 3.5: Module (`<resource>.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <ResourceName> } from './entities/<resource>.entity.js';
import { <ResourceName>Service } from './<resource>.service.js';
import { <ResourceName>Controller } from './<resource>.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([<ResourceName>])],
  controllers: [<ResourceName>Controller],
  providers: [<ResourceName>Service],
  exports: [<ResourceName>Service],
})
export class <ResourceName>Module {}
```

### Step 3.6: Wire in `AppModule` (`backend/src/app.module.ts`)
1. Import and add `<ResourceName>` entity to `TypeOrmModule.forRootAsync` entities array.
2. Import and add `<ResourceName>Module` to the `imports` array of `AppModule`.

---

## 4. Verification

After creating the module:
```bash
cd backend
npm run build
npm run lint
npm test
```
All commands must pass with zero errors.
