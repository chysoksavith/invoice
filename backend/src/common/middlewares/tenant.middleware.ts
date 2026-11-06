import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TENANT_HEADER } from '../constants/tenant.constants.js';
import { TenantService } from '../../modules/tenant/tenant.service.js';

export interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: any;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    const rawTenantId = req.headers[TENANT_HEADER];

    // Optional: resolve via subdomain if header is not present
    // const subdomain = req.hostname.split('.')[0];

    if (!rawTenantId || Array.isArray(rawTenantId)) {
      return next();
    }

    const tenant = await this.tenantService.findById(rawTenantId);
    if (!tenant || !tenant.isActive) {
      throw new BadRequestException('Invalid or inactive tenant');
    }

    req.tenantId = tenant.id;
    req.tenant = tenant;

    next();
  }
}