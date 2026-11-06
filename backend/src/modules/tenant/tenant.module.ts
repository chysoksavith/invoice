import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity.js';
import { TenantUser } from './entities/tenant-user.entity.js';
import { TenantService } from './tenant.service.js';
import { TenantController } from './tenant.controller.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantUser])],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService, TypeOrmModule],
})
export class TenantModule {}
