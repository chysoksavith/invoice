import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { TenantRequest } from "../middlewares/tenant.middleware.js";

@Injectable()
export class TenantGuard implements CanActivate { 
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<TenantRequest>();


        if(!request.tenantId){
            throw new UnauthorizedException('tenant context is missing or invalid');
        }

        return true;
    }
}
