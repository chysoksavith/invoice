import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import appConfig from './config/app.config.js'
import databaseConfig from './config/database.config.js'
import jwtConfig from './config/jwt.config.js'
import { User } from './modules/users/entities/user.entity.js'
import { Tenant } from './modules/tenant/entities/tenant.entity.js'
import { TenantUser } from './modules/tenant/entities/tenant-user.entity.js'
import { UsersModule } from './modules/users/users.module.js'
import { AuthModule } from './modules/auth/auth.module.js'
import { TenantModule } from './modules/tenant/tenant.module.js'
import { TenantMiddleware } from './common/middlewares/tenant.middleware.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host', 'localhost'),
        port: config.get<number>('database.port', 5432),
        username: config.get<string>('database.username', 'savit'),
        password: config.get<string>('database.password', '12345'),
        database: config.get<string>('database.database', 'nuxt'),
        entities: [User, Tenant, TenantUser],
        synchronize: config.get<boolean>('database.synchronize', true), // Auto-creates tables in dev
      }),
    }),
    UsersModule,
    AuthModule,
    TenantModule,
  ],
})

export class AppModule implements  NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        {path: 'tenants', method: RequestMethod.ALL},
        {path: 'tenants/(.*)', method: RequestMethod.ALL}
      )
      .forRoutes('*');
  }
}
