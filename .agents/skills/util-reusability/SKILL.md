---
name: util-reusability
description: >-
  Use this skill to audit, extract, design, and test reusable utilities, helpers, custom decorators, and shared DTOs in backend/src/common/.
  Enforces the "Think Reusable First" discipline across services, modules, and database queries.
---

# Reusable Utility Design & Extraction Runbook

This guide instructs the agent on how to enforce code reuse discipline and avoid logic duplication in the NestJS backend.

---

## 1. When to Extract Logic into a Utility

Before writing logic directly in a service or controller, evaluate against these criteria:

| Scenario | Example | Destination |
| :--- | :--- | :--- |
| **Financial / Money Math** | NBC exchange rate conversion, VAT calculation, 2-decimal rounding | `backend/src/common/utils/money.ts` |
| **String & Identifier Formatting** | Slug generation, gapless invoice prefixing, phone formatting | `backend/src/common/utils/string.ts` or `slugify.ts` |
| **Date & Accounting Periods** | Fiscal year ranges, Cambodia tax declaration dates | `backend/src/common/utils/date.ts` |
| **Query & Pagination Helpers** | Filtering by date range, multi-column search, ordering | `backend/src/common/utils/query.ts` |
| **Custom Parameter Extraction** | Extracting current tenant, active role, permissions | `backend/src/common/decorators/` |
| **Cross-Cutting Authorization** | Role check, subscription tier check | `backend/src/common/guards/` |

---

## 2. Requirements for Reusable Utilities

Every utility function in `backend/src/common/utils/` must meet these 5 standards:

1. **Pure Function Design**:
   - The function should take explicit arguments and return a value without hidden side effects.
2. **Strict TypeScript Types**:
   - No implicit or explicit `any` unless strictly generic (`<T extends ObjectLiteral>`).
3. **JSDoc Documentation**:
   - Include function purpose, description, `@param`, `@returns`, and an `@example` snippet.
4. **Exported via Barrel File**:
   - Always re-export from `backend/src/common/utils/index.ts` so consumers can import cleanly.
5. **Vitest Unit Test Coverage**:
   - Every utility must have a companion `<name>.spec.ts` test file validating edge cases (null, empty strings, boundary numbers, negative amounts).

---

## 3. Utility Implementation Template

### 3.1 Function Structure (`backend/src/common/utils/<name>.ts`)

```typescript
/**
 * Short summary of what this utility does.
 *
 * @param value Description of input value.
 * @param options Optional configuration parameters.
 * @returns Description of output.
 *
 * @example
 * ```ts
 * const result = myUtil('sample-text', { lowercase: true });
 * ```
 */
export function myUtil(value: string, options?: { lowercase?: boolean }): string {
  if (!value) return '';
  const result = value.trim();
  return options?.lowercase ? result.toLowerCase() : result;
}
```

### 3.2 Companion Unit Test (`backend/src/common/utils/<name>.spec.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { myUtil } from './<name>.js';

describe('myUtil', () => {
  it('should format string correctly', () => {
    expect(myUtil('  Test  ', { lowercase: true })).toBe('test');
  });

  it('should handle empty input safely', () => {
    expect(myUtil('')).toBe('');
  });
});
```

### 3.3 Register in Barrel File (`backend/src/common/utils/index.ts`)

```typescript
export * from './paginate.js';
export * from './<name>.js';
```

---

## 4. Verification

Run the test suite to ensure the new utility passes all test cases:
```bash
cd backend
npm test
npm run lint
```
