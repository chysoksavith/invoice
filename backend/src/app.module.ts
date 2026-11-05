import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import appConfig from './config/app.config.js'
import databaseConfig from './config/database.config.js'
import jwtConfig from './config/jwt.config.js'
import { User } from './modules/users/entities/user.entity.js'
import { UsersModule } from './modules/users/users.module.js'
import { AuthModule } from './modules/auth/auth.module.js'

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
        database: config.get<string>('database.database', 'mlv8'),
        entities: [User],
        synchronize: false, // Keep false to preserve existing schema & data
      }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
