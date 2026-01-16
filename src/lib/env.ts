import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL fehlt"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY fehlt"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM fehlt"),
  APP_URL: z.string().url("APP_URL muss eine URL sein"),
});

export const env = envSchema.parse(process.env);
