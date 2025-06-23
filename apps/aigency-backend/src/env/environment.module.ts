import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

export const envSchema = z
  .object({
    POSTGRES_HOST: z.string().min(1, 'POSTGRES_HOST is required'),
    POSTGRES_PORT: z
      .string()
      .regex(/^\d+$/, 'POSTGRES_PORT must be a number')
      .default('5432'),
    DB_USERNAME: z.string().min(1, 'DB_USERNAME is required'),
    DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
    DB_NAME: z.string().min(1, 'DB_NAME is required'),
    POSTGRES_SCHEMA: z.string().default('default'),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    AIGENCY_API_URL: z.string().url(),
    NEAR_LOGIN_CONTRACT_ID: z.string().nonempty(),
    TELEGRAM_BOT_USERNAME: z.string().nonempty(),
    TELEGRAM_MAIN_BOT_ID: z.number({ coerce: true }),
    TELEGRAM_DEBUG_BOT_ID: z.number({ coerce: true }).optional(),
    TELEGRAM_BOT_TOKEN: z.string().nonempty(),
    NEAR_NETWORK_ID: z.string().nonempty(),
    NEAR_NODE_URL: z.string().url(),
    NEAR_WALLET_URL: z.string().url(),
    NEAR_HELPER_URL: z.string().url(),
    NFT_CONTRACT_OWNER_PRIVATE_KEY: z.string().nonempty(),
    NFT_CONTRACT_OWNER_ID: z.string().nonempty(),
    NFT_CONTRACT_ID: z.string().nonempty(),
    TELEGRAM_MONITORING_TOPIC_ID: z.string().nonempty(),
    TELEGRAM_MONITORING_CHAT_ID: z.string().nonempty(),
    REWARD_ACCOUNT_PRIVATE_KEY: z.string().nonempty(),
    REWARD_ACCOUNT_ID: z.string().nonempty(),
    BUG_REWARD_AMOUNT: z.string().nonempty(),
    USAGE_REWARD_AMOUNT: z.string().nonempty(),
  })
  // Cast POSTGRES_PORT → number so callers get the right type
  .transform((vars) => ({ ...vars, POSTGRES_PORT: Number(vars.POSTGRES_PORT) }));

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
