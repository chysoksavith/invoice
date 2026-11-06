import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TenantUserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  STAFF = 'STAFF',
}

@Entity('tenant_users')
@Index('idx_tenant_users_lookup', ['tenantId', 'userId'])
@Index('uq_tenant_users', ['tenantId', 'userId'], { unique: true })
export class TenantUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: TenantUserRole.STAFF,
  })
  role: TenantUserRole;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  permissions: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
