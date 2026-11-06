# Workspace AI Agent Harness & Engineering Rules

Welcome to the **Cambodian Multi-Tenant SaaS Invoicing & Accounting System** workspace.

This repository is a fullstack modular application:
- **Frontend** (`src/`, `nuxt.config.ts`): Nuxt 4 (Vue 3, TypeScript, TailwindCSS v4, DaisyUI v5).
- **Backend** (`backend/`): NestJS 12 (ESM TypeScript, Modular Monolith, PostgreSQL, TypeORM).
- **Architecture Reference**: [docs/ACCOUNTING_SYSTEM_DESIGN.md](file:///home/savit/Learning/my-app/docs/ACCOUNTING_SYSTEM_DESIGN.md).

All AI agents working in this repository must operate under the discipline and conventions specified below.

---

## 1. Core Operating Principles

1. **Strict Multi-Tenant Isolation**:
   - Every tenant data query and write **must** be scoped to `tenantId`.
   - Never expose or mutate data across tenant boundaries.
   - Tenant-owned entities must extend `TenantBaseEntity` from `backend/src/common/entities/tenant-base.entity.js`.
   - Tenant-scoped endpoints must use `@UseGuards(JwtAuthGuard, TenantGuard)` and extract tenant context using `@CurrentTenantId()`.

2. **"Util-First" & Reusability Mandate**:
   - **Pause and Think Before Writing Inline Logic**: Before writing data transformations, formatting, mathematical calculations (e.g. money, exchange rates, taxes), slug generation, date filters, or repetitive query builder patterns, ask:
     > *"Can this logic be used in another module, service, or endpoint?"*
   - If the answer is **YES** (or likely yes):
     1. Create a pure, reusable function in `backend/src/common/utils/<util-name>.ts`.
     2. Export it via `backend/src/common/utils/index.ts`.
     3. Add clear TypeScript types, JSDoc documentation, and unit tests (`<util-name>.spec.ts`).
     4. Consume the utility in your service/controller.
   - **Check Before Building**: Always inspect `backend/src/common/` (`utils/`, `decorators/`, `guards/`, `dto/`, `interface/`) to reuse existing primitives (e.g., `paginate(...)`, `PaginationQueryDto`, `PaginatedResult<T>`). Never re-implement pagination or generic helpers inline.

3. **Strict ESM Import Syntax in Backend**:
   - `backend/package.json` specifies `"type": "module"`.
   - **Mandatory**: All internal relative TypeScript imports must specify the `.js` extension:
     ```typescript
     // ✅ CORRECT
     import { User } from './entities/user.entity.js';
     import { paginate } from '../../common/utils/paginate.js';

     // ❌ WRONG (will break NestJS ESM runtime)
     import { User } from './entities/user.entity';
     import { paginate } from '../../common/utils/paginate';
     ```

4. **Strict Module Folder Structure**:
   - Every backend feature module in `backend/src/modules/<resource>/` must strictly adhere to:
     ```text
     backend/src/modules/<resource>/
     ├── dto/
     │   ├── create-<resource>.dto.ts
     │   ├── update-<resource>.dto.ts
     │   └── query-<resource>.dto.ts (extends PaginationQueryDto if searchable/paginated)
     ├── entities/
     │   └── <resource>.entity.ts (extends TenantBaseEntity for tenant data)
     ├── <resource>.controller.ts
     ├── <resource>.service.ts
     ├── <resource>.module.ts
     └── <resource>.service.spec.ts (Vitest unit test)
     ```

5. **Type Safety & DTO Validation**:
   - Global NestJS `ValidationPipe` is enabled with `whitelist: true`, `transform: true`, and `forbidNonWhitelisted: true`.
   - Every property in DTOs must have explicit `class-validator` and `class-transformer` decorators.
   - Update DTOs must extend `PartialType(Create<Resource>Dto)` from `@nestjs/mapped-types`.
   - All UUID route parameters must use `@Param('id', ParseUUIDPipe) id: string`.

6. **Verification Discipline**:
   - After creating or editing code in `backend/`, always run:
     ```bash
     cd backend && npm run build
     cd backend && npm run lint
     cd backend && npm test
     ```
   - Ensure zero build errors and zero linter warnings.

---

## 2. Agent Skills Catalog

When performing tasks in this workspace, refer to and invoke these specialized skills:

- **`backend-crud`** (`.agents/skills/backend-crud/SKILL.md`):
  Use when creating, expanding, or modifying backend CRUD features, modules, entities, services, and controllers.
- **`util-reusability`** (`.agents/skills/util-reusability/SKILL.md`):
  Use when identifying, designing, extracting, or testing shared utilities in `backend/src/common/utils/`.

---

## 3. Reference Files
- Master Architecture & System Design: [ACCOUNTING_SYSTEM_DESIGN.md](file:///home/savit/Learning/my-app/docs/ACCOUNTING_SYSTEM_DESIGN.md)
- Backend Agent Rules: [backend/AGENTS.md](file:///home/savit/Learning/my-app/backend/AGENTS.md)
