import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantRequest } from '../middlewares/tenant.middleware.js';

export const CurrentTenant = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    const tenant = request.tenant;

    if (!tenant) return null;
    return data ? tenant[data] : tenant;
  },
);

export const CurrentTenantId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.tenantId;
  },
);