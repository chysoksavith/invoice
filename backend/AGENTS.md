# Backend Agent Rules & Engineering Discipline

This directory contains the NestJS 12 backend for the Cambodian Multi-Tenant SaaS Accounting & Invoicing system.

---

## 1. Production Telemetry: NestJS Observe

This app's production telemetry - traces, errors, logs and metrics - goes to [NestJS Observe](https://observe.nestjs.com). Until `ObserveModule` is registered in `src/app.module.ts`, nothing is sent: `npx @nestjs/observe link` sets it up in one step - it installs `@nestjs/observe`, wires it into the app, and writes the key pair (`OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET`) to `.env`.

When a task depends on how the app behaves in production - an error users hit, a slow endpoint, a failing job, whether a release made things worse - work from that data, not from the code alone:
- The Observe MCP server answers those questions directly: errors with their traces and logs, slow operations, jobs, and what a release changed (`find_regressions`, `diff_release`). It is included on the Pro plan and above. In Claude Code: `claude mcp add observe --transport http https://observe-api.nestjs.com/mcp`, and the client opens a browser to approve. Other clients: https://www.observe.nestjs.com/documentation/mcp
- Without it, the user can open the request or error in the Observe dashboard and click **Copy agent prompt**, which hands over that page's trace, stack and logs as text.

---

## 2. ESM Import Syntax (Strict Requirement)

`backend/package.json` specifies `"type": "module"`.
**Rule**: Every relative TypeScript import must include the `.js` extension!
```typescript
// ✅ CORRECT
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { paginate } from '../../common/utils/paginate.js';

// ❌ FORBIDDEN
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
```

---

## 3. Mandatory CRUD Module Folder Structure

Every feature module in `src/modules/<resource>/` MUST follow this exact directory layout:

```text
src/modules/<resource>/
├── dto/
│   ├── create-<resource>.dto.ts      # Validated input payload for creation
│   ├── update-<resource>.dto.ts      # PartialType(Create<Resource>Dto)
│   └── query-<resource>.dto.ts       # Extends PaginationQueryDto for listing/filtering
├── entities/
│   └── <resource>.entity.ts          # TypeORM Entity (extends TenantBaseEntity if tenant-scoped)
├── <resource>.controller.ts          # REST endpoints, guards, param validation
├── <resource>.service.ts             # Business logic, tenant scoping, paginate helper
├── <resource>.module.ts              # TypeOrmModule.forFeature, exports, imports
└── <resource>.service.spec.ts        # Vitest unit tests for service methods
```

---

## 4. "Util-First" & Code Reusability Discipline

**Core Mandate**: Avoid inline repetition. Always check, reuse, and abstract shared functionality.

### 4.1 Check Before You Build
Before writing a helper function, query builder snippet, or transformation, search `src/common/`:
- `src/common/utils/paginate.js` -> Global pagination helper for Repositories and QueryBuilders.
- `src/common/dto/pagination-query.dto.js` -> Standard `page` and `limit` DTO.
- `src/common/interface/paginated-result.interface.js` -> Standard pagination response format.
- `src/common/decorators/` -> `@CurrentTenant()`, `@CurrentTenantId()`, `@CurrentUser()`.
- `src/common/guards/` -> `JwtAuthGuard`, `TenantGuard`.
- `src/common/entities/tenant-base.entity.js` -> Base entity with `id`, `tenantId`, `createdAt`, `updatedAt`.

### 4.2 The "Think Reusable" Decision Rule
Whenever you are about to write:
- Math or calculation logic (e.g., currency conversion, NBC rate calculation, tax formulas, rounding)
- String manipulations (e.g., slug generation, code generation, sanitize Khmer/English text)
- Date manipulation or range generation (e.g., fiscal year, accounting periods, Cambodian holidays)
- Reusable TypeORM query filters or search builder logic
- Reusable DTOs, custom validators, or decorators

**You must:**
1. Extract it into a standalone file under `src/common/utils/<name>.ts` (or appropriate `common/` subdirectory).
2. Export it from `src/common/utils/index.ts`.
3. Design it as a **pure function** with explicit TypeScript types and JSDoc documentation with examples.
4. Add unit test coverage in `src/common/utils/<name>.spec.ts`.
5. Import and consume it inside your module service/controller.

---

## 5. Multi-Tenancy Security Rules

1. **Entity Layer**:
   - Any entity that belongs to a tenant MUST extend `TenantBaseEntity`:
     ```typescript
     import { Entity, Column } from 'typeorm';
     import { TenantBaseEntity } from '../../common/entities/tenant-base.entity.js';

     @Entity('products')
     export class Product extends TenantBaseEntity {
       @Column({ type: 'varchar', length: 255 })
       name: string;
     }
     ```
2. **Controller Layer**:
   - Protect tenant endpoints with `@UseGuards(JwtAuthGuard, TenantGuard)`.
   - Pass the tenant ID to services using `@CurrentTenantId() tenantId: string`.
3. **Service Layer**:
   - Every `find`, `findOne`, `update`, `delete`, and `count` query MUST include `tenantId`:
     ```typescript
     async findById(tenantId: string, id: string): Promise<Product> {
       const product = await this.productRepository.findOne({
         where: { id, tenantId },
       });
       if (!product) throw new NotFoundException(`Product #${id} not found`);
       return product;
     }
     ```
   - On creation, ALWAYS attach `tenantId`:
     ```typescript
     async create(tenantId: string, dto: CreateProductDto): Promise<Product> {
       const product = this.productRepository.create({ ...dto, tenantId });
       return this.productRepository.save(product);
     }
     ```

---

## 6. Controller & DTO Discipline

1. **HTTP Methods & Routes**:
   - `POST   /api/<resources>`        -> `@Post()`
   - `GET    /api/<resources>`        -> `@Get()` with `@Query() queryDto: Query<Resource>Dto`
   - `GET    /api/<resources>/:id`    -> `@Get(':id')` with `@Param('id', ParseUUIDPipe)`
   - `PATCH  /api/<resources>/:id`    -> `@Patch(':id')` with `@Param('id', ParseUUIDPipe)` and `@Body()`
   - `DELETE /api/<resources>/:id`    -> `@Delete(':id')` with `@Param('id', ParseUUIDPipe)`
2. **Validation**:
   - Whitelist validation is active. Non-decorated properties are stripped or rejected.
   - Use `class-validator` (`@IsString()`, `@IsNotEmpty()`, `@IsNumber()`, `@IsEnum()`, etc.).
   - Update DTOs must use `export class Update<Resource>Dto extends PartialType(Create<Resource>Dto) {}`.

---

## 7. Verification Workflow

Always verify your changes before reporting completion:
```bash
npm run build      # Must succeed with 0 TypeScript/compilation errors
npm run lint       # Must pass oxlint with 0 errors/warnings
npm test           # Run Vitest test suite
```

---

## 8. TypeORM Migration Discipline

- **Never use `synchronize: true` in production** — migrations are the only sanctioned schema-change mechanism.
- When an entity field is added, removed, renamed, or retyped, generate a migration:
  ```bash
  cd backend && npm run migration:generate -- src/database/migrations/<MigrationName>
  ```
- Always review the generated SQL before committing — do not auto-apply blindly.
- Never delete a migration file once it has been applied to any environment.
- Migration file naming: `<Timestamp>-<PascalCaseName>.ts` (auto-generated by TypeORM CLI).

---

## 9. Error Handling Standards

- Use NestJS built-in HTTP exception classes exclusively — **never** `throw new Error(message)`:

  | Situation | Exception to Use |
  |---|---|
  | Resource not found (tenant-scoped) | `NotFoundException('ResourceName #${id} not found')` |
  | Duplicate / already exists | `ConflictException('ResourceName with this value already exists')` |
  | Invalid input / business rule violation | `BadRequestException(message)` |
  | Caller lacks permission | `ForbiddenException()` |
  | Missing required context (e.g., tenant) | `UnauthorizedException()` |

- Always include the resource name and ID in `NotFoundException` messages for debuggability.

---

## 10. Soft-Delete Policy

- Entities with business records (invoices, products, contacts, journal entries) **MUST** support soft delete:
  - Use `@DeleteDateColumn({ name: 'deleted_at' })` on the entity or in `TenantBaseEntity`.
  - Use `repository.softRemove(entity)` instead of `repository.remove(entity)`.
  - `findAll` queries must never include soft-deleted rows — TypeORM excludes them by default, but add explicit checks when using raw query builders.
- System/global entities (currencies, tenant config, users) may use hard delete at team discretion.
