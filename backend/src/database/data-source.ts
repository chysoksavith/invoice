import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import { User } from '../modules/users/entities/user.entity.js'

config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'savit',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_DATABASE || 'mlv8',
  entities: [User],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
})
