import z from 'zod';

export const PaginationSchema = z.object({
  limit: z.number(),
  offset: z.number(),
});

export type PaginationDto = z.infer<typeof PaginationSchema>;
