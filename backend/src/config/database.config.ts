import { registerAs } from '@nestjs/config'

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'savit',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_DATABASE || 'nuxt',
  synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in development!
}))
