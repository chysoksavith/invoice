import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tenant } from "./entities/tenant.entity.js";
import { Repository } from "typeorm";
import { CreateTenantDto } from "./dto/create-tenant.dto.js";
import { UpdateTenantDto } from "./dto/update-tenant.dto.js";

@Injectable()
export class TenantService {

    constructor(
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant> ,
    ){}


    async create(dto: CreateTenantDto) : Promise<Tenant> {
        const existing = await this.tenantRepository.findOne({
            where: {slug: dto.slug},
        });

        if(existing) {
            throw new ConflictException(`tenant with slug '${dto.slug}' already exists`);
        }

        const tenant = this.tenantRepository.create(dto);
        return this.tenantRepository.save(tenant);
    }


    async findAll(): Promise<Tenant[]> {

        return this.tenantRepository.find();

    }

    async findById(id: string): Promise<Tenant | null> {

        return this.tenantRepository.findOne({ where: { id } });
    }


    async findBySlug (slug: string): Promise<Tenant> {
        
        const tenant = await this.tenantRepository.findOne({
            where: {slug}
        });
       
        if(!tenant){
            throw new NotFoundException(`Tenant '${slug}' not found`);
        }

        return tenant;

    }

    async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
        const tenant = await this.findById(id);

        if(!tenant) {
            throw new NotFoundException(`tenant not found `);
        }

        Object.assign(tenant, dto);
        return this.tenantRepository.save(tenant);
    }

}