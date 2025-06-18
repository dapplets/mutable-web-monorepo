import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

export const envSchema = z
  .object({
    DB_HOST: z.string().min(1, 'DB_HOST is required'),
    DB_PORT: z
      .string()
      .regex(/^\d+$/, 'DB_PORT must be a number')
      .default('5432'),
    DB_USERNAME: z.string().min(1, 'DB_USERNAME is required'),
    DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
    DB_NAME: z.string().min(1, 'DB_NAME is required'),
    DB_SCHEMA: z.string().default('default'),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    NEAR_NODE_URL: z.string().url(),
    AIGENCY_API_URL: z.string().url(),
    NEAR_WALLET_URL: z.string().url(),
    NEAR_LOGIN_CONTRACT_ID: z.string().nonempty(),
    TELEGRAM_BOT_USERNAME: z.string().nonempty(),
    TELEGRAM_MAIN_BOT_ID: z.number({ coerce: true }),
    TELEGRAM_DEBUG_BOT_ID: z.number({ coerce: true }).optional(),
    TELEGRAM_BOT_TOKEN: z.string().nonempty(),
  })
  // Cast DB_PORT → number so callers get the right type
  .transform((vars) => ({ ...vars, DB_PORT: Number(vars.DB_PORT) }));

export function validateEnv(raw: Record<string, unknown>) {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `• ${i.path.join('.')} – ${i.message}`)
      .join('\n');
    throw new Error(`❌ Invalid environment variables:\n${message}`);
  }
  return parsed.data;
}

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
  exports: [ConfigModule], // so downstream modules can inject ConfigService
})
export class EnvironmentModule {}
