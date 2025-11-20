import { ZodError } from 'zod';

export type ZodResponseType<request> = { success: true | false; data?: request, error?: ZodError }