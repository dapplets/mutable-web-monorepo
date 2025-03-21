export const CRAWLER_API_PORT = process.env.CRAWLER_API_PORT ?? 3001;

export const CRAWLER_PRIVATE_KEY =
  process.env.CRAWLER_PRIVATE_KEY ??
  '47iCoTjh8fgLcoGCuqcMkTjVXjv2vpoCLHaJ9pKejv7dTBh1gzHiPkMvLX72p3dkE3JkS9ru8eyioWH6mrrRKV8k';

export const CRAWLER_DATABASE_URL =
  process.env.CRAWLER_DATABASE_URL ??
  'postgres://user:password@localhost:5432/mweb';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';

export const NEARAI_API_KEY = process.env.NEARAI_API_KEY;
