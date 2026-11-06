import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { TenantService } from "./tenant.service.js";
import { CreateTenantDto } from "./dto/create-tenant.dto.js";
import { UpdateTenantDto } from "./dto/update-tenant.dto.js";

@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) {}

    @Post()
    create(@Body() dto: CreateTenantDto) {
        return this.tenantService.create(dto);
    }

    @Get()
    findAll(){
        return this.tenantService.findAll();
    }   

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string){
        return this.tenantService.findById(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateTenantDto,
    ){
        return this.tenantService.update(id, dto);
    }
}